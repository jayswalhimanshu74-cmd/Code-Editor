/**
 * Client-side JavaScript runner using Web Worker (Blob URL).
 * Captures console.log/info/warn/error, enforces a 5s execution timeout,
 * and caps output at ~100 KB.
 */
export const runJs = (code, stdin = '') => {
  return new Promise((resolve) => {
    const MAX_OUTPUT = 100_000;
    let stdout = '';
    let stderr = '';
    let settled = false;

    const appendStdout = (str) => {
      if (stdout.length < MAX_OUTPUT) {
        stdout += str;
        if (stdout.length >= MAX_OUTPUT) {
          stdout = stdout.slice(0, MAX_OUTPUT) + '\n... [Output truncated after 100 KB]';
        }
      }
    };

    const appendStderr = (str) => {
      if (stderr.length < MAX_OUTPUT) {
        stderr += str;
        if (stderr.length >= MAX_OUTPUT) {
          stderr = stderr.slice(0, MAX_OUTPUT) + '\n... [Output truncated after 100 KB]';
        }
      }
    };

    const workerScript = `
      self.onmessage = async (e) => {
        const { code } = e.data;
        const formatArg = (arg) => {
          if (typeof arg === 'object' && arg !== null) {
            try { return JSON.stringify(arg, null, 2); } catch (_) { return String(arg); }
          }
          return String(arg);
        };

        const postLog = (type, args) => {
          const text = args.map(formatArg).join(' ') + '\\n';
          self.postMessage({ type, text });
        };

        console.log = (...args) => postLog('stdout', args);
        console.info = (...args) => postLog('stdout', args);
        console.warn = (...args) => postLog('stderr', args);
        console.error = (...args) => postLog('stderr', args);

        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          await new AsyncFunction(code)();
          self.postMessage({ type: 'done', exitCode: 0 });
        } catch (err) {
          postLog('stderr', [err?.stack || err?.message || String(err)]);
          self.postMessage({ type: 'done', exitCode: 1 });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker;

    try {
      worker = new Worker(workerUrl);
    } catch (err) {
      URL.revokeObjectURL(workerUrl);
      return resolve({
        stdout: '',
        stderr: `Failed to initialize JavaScript Web Worker: ${err.message}`,
        exitCode: 1,
      });
    }

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      try { worker.terminate(); } catch {
        // Ignore termination error
      }
      try { URL.revokeObjectURL(workerUrl); } catch {
        // Ignore revocation error
      }
    };

    const finish = (exitCode) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), exitCode });
    };

    const timer = setTimeout(() => {
      appendStderr('\n[Execution timed out (5s limit)]');
      finish(124);
    }, 5000);

    worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === 'stdout') {
        appendStdout(msg.text);
      } else if (msg.type === 'stderr') {
        appendStderr(msg.text);
      } else if (msg.type === 'done') {
        finish(msg.exitCode ?? 0);
      }
    };

    worker.onerror = (err) => {
      appendStderr(`Runtime Error: ${err.message || 'Worker error'}\n`);
      finish(1);
    };

    worker.postMessage({ code, stdin });
  });
};

