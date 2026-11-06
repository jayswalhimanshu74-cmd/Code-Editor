import useWarmupStore from '../store/warmupStore';
import { getBackendUrl } from '../api/axios';

/**
 * Pings the lightweight /health endpoint asynchronously to trigger Render free-tier wake-up early.
 */
export function warmServer() {
  try {
    const backendUrl = getBackendUrl();
    fetch(`${backendUrl}/health`, { method: 'GET', mode: 'no-cors' }).catch(() => {
      // Intentionally ignore background warm-up ping failures
    });
  } catch {
    // Ignore URL resolution errors
  }
}

/**
 * Checks whether an error is indicative of a sleeping or restarting free-tier container.
 * Retries strictly for network errors (no response) and 502/503/504 bad gateway/unavailable statuses.
 * Never retries 4xx errors (e.g. 401 wrong password or 400 validation failures fail immediately).
 */
function isColdStartError(err) {
  if (!err) return false;
  if (!err.response) return true; // Network failure, connection refused, or timeout
  const status = err.response.status;
  return status === 502 || status === 503 || status === 504;
}

/**
 * Wraps an async request (like login or initial room fetch) with cold-start detection:
 * - Shows waking up banner if response takes >3s or encounters 502/503/504
 * - Retries with backoff up to ~60s total
 * - Hides banner immediately once request succeeds
 */
export async function withColdStartRetry(requestFn, options = {}) {
  const {
    maxDurationMs = 60000,
    initialDelayMs = 2000,
    timeoutThresholdMs = 3000,
  } = options;

  const startTime = Date.now();
  let delay = initialDelayMs;
  let slowTimer = null;

  const startSlowTimer = () => {
    if (!slowTimer) {
      slowTimer = setTimeout(() => {
        useWarmupStore.getState().setIsWakingUp(true);
      }, timeoutThresholdMs);
    }
  };

  const clearSlowTimer = () => {
    if (slowTimer) {
      clearTimeout(slowTimer);
      slowTimer = null;
    }
  };

  startSlowTimer();

  while (Date.now() - startTime < maxDurationMs) {
    try {
      const result = await requestFn();
      clearSlowTimer();
      useWarmupStore.getState().reset();
      return result;
    } catch (err) {
      // Non-cold-start errors (e.g. 400 Bad Request, 401 Invalid Credentials, 403 Forbidden, 404) should fail immediately
      if (!isColdStartError(err)) {
        clearSlowTimer();
        useWarmupStore.getState().reset();
        throw err;
      }

      // Mark that server is waking up
      useWarmupStore.getState().setIsWakingUp(true);

      const elapsed = Date.now() - startTime;
      const remaining = maxDurationMs - elapsed;
      if (remaining <= 1000) {
        break;
      }

      const waitTime = Math.min(delay, remaining);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      delay = Math.min(Math.round(delay * 1.5), 10000);
    }
  }

  clearSlowTimer();
  const retryAction = () => withColdStartRetry(requestFn, options);
  useWarmupStore.getState().setError(
    'Server took too long to wake up. Free-tier instances may take up to a minute to start.',
    retryAction
  );
  throw new Error('Server wake-up timed out after 60s');
}

