/**
 * Hardened Client-side Python runner using Pyodide inside a Web Worker
 * hosted within a sandboxed iframe (sandbox="allow-scripts" ONLY).
 *
 * This ensures the execution context has an opaque origin ("null") with
 * zero access to the application's origin, cookies, localStorage, or API credentials.
 * Loads Pyodide once lazily and caches it in a shared promise.
 * Execution timeout (10s) starts ONLY after Pyodide is ready.
 * Infinite loops are killed via worker.terminate() and a fresh worker is spawned.
 */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let sharedPyodidePromise = null;
let isPyodideLoaded = false;
let sandboxIframe = null;
let iframeReadyPromise = null;

// Worker script that runs inside the sandboxed iframe
const workerScript = `
  let pyodideInstance = null;
  let initPromise = null;

  const postStdout = (text) => self.postMessage({ type: 'stdout', text });
  const postStderr = (text) => self.postMessage({ type: 'stderr', text });

  async function initPyodide(cdnBase) {
    if (pyodideInstance) return pyodideInstance;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      importScripts(cdnBase + 'pyodide.js');
      pyodideInstance = await loadPyodide({
        indexURL: cdnBase,
      });
      self.postMessage({ type: 'pyodide_ready' });
      return pyodideInstance;
    })();

    return initPromise;
  }

  self.onmessage = async (e) => {
    const data = e.data;
    if (!data) return;

    if (data.type === 'init') {
      try {
        await initPyodide(data.cdnBase);
      } catch (err) {
        self.postMessage({
          type: 'init_error',
          error: err?.message || String(err),
        });
      }
      return;
    }

    if (data.type === 'run') {
      const { id, code, stdin, cdnBase } = data;
      try {
        const py = await initPyodide(cdnBase);

        let stdinQueue = stdin ? stdin.split('\\n') : [];

        py.setStdout({
          batched: (text) => postStdout(text + '\\n')
        });

        py.setStderr({
          batched: (text) => postStderr(text + '\\n')
        });

        py.setStdin({
          read: () => {
            if (stdinQueue.length > 0) {
              return stdinQueue.shift() + '\\n';
            }
            throw new Error('INTERACTIVE_INPUT_CALLED');
          }
        });

        await py.runPythonAsync(code);
        self.postMessage({ type: 'done', id, exitCode: 0 });
      } catch (err) {
        let msg = err?.message || String(err);
        if (msg.includes('INTERACTIVE_INPUT_CALLED') || msg.includes('StdinNotImplementedError') || msg.includes('input()')) {
          postStderr('\\n[Notice] Interactive input() is not supported in the browser runner. Use the stdin input box or the backend runner.\\n');
        } else {
          postStderr(msg + '\\n');
        }
        self.postMessage({ type: 'done', id, exitCode: 1 });
      }
    }
  };
`;

const safeWorkerScript = JSON.stringify(workerScript).replace(/<\/script/gi, '<\\/script');

const iframeHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
  (function() {
    var worker = null;
    var blobUrl = null;
    var workerContent = ${safeWorkerScript};
    var cdnBase = ${JSON.stringify(PYODIDE_CDN_BASE)};

    function createWorker() {
      if (worker) {
        try { worker.terminate(); } catch (e) {}
        worker = null;
      }
      if (!blobUrl) {
        var blob = new Blob([workerContent], { type: 'application/javascript' });
        blobUrl = URL.createObjectURL(blob);
      }
      worker = new Worker(blobUrl);

      worker.onmessage = function(e) {
        window.parent.postMessage(e.data, '*');
      };

      worker.onerror = function(e) {
        window.parent.postMessage({
          type: 'stderr',
          text: 'Python Worker Error: ' + (e.message || 'Unknown runtime error') + '\\n'
        }, '*');
        window.parent.postMessage({ type: 'done', exitCode: 1 }, '*');
      };

      worker.postMessage({ type: 'init', cdnBase: cdnBase });
    }

    window.addEventListener('message', function(event) {
      var data = event.data;
      if (!data) return;

      if (data.type === 'start') {
        createWorker();
      } else if (data.type === 'run') {
        if (!worker) {
          createWorker();
        }
        worker.postMessage(data);
      } else if (data.type === 'kill') {
        createWorker();
      }
    });

    window.parent.postMessage({ type: 'iframe_ready' }, '*');
  })();
</script>
</body>
</html>`;

function ensureSandbox() {
  if (sandboxIframe && iframeReadyPromise) {
    return iframeReadyPromise;
  }

  iframeReadyPromise = new Promise((resolve, reject) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.srcdoc = iframeHtml;

      const handleIframeReady = (event) => {
        if (event.source === iframe.contentWindow && event.data?.type === 'iframe_ready') {
          window.removeEventListener('message', handleIframeReady);
          resolve(iframe);
        }
      };

      window.addEventListener('message', handleIframeReady);

      iframe.onload = () => {
        // Fallback in case message was fired before listener
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'ping' }, '*');
        }
      };

      document.body.appendChild(iframe);
      sandboxIframe = iframe;
    } catch (err) {
      reject(err);
    }
  });

  return iframeReadyPromise;
}

export const isPythonReady = () => isPyodideLoaded;

/**
 * Loads Pyodide once lazily, cached in a shared promise.
 * Resolves as soon as the Web Worker is initialized and Pyodide is ready.
 */
export const preloadPython = () => {
  if (isPyodideLoaded) {
    return Promise.resolve();
  }
  if (sharedPyodidePromise) {
    return sharedPyodidePromise;
  }

  sharedPyodidePromise = new Promise((resolve, reject) => {
    ensureSandbox()
      .then((iframe) => {
        const onMessage = (event) => {
          if (event.source !== iframe.contentWindow) return;
          if (event.data?.type === 'pyodide_ready') {
            window.removeEventListener('message', onMessage);
            isPyodideLoaded = true;
            resolve();
          } else if (event.data?.type === 'init_error') {
            window.removeEventListener('message', onMessage);
            sharedPyodidePromise = null;
            isPyodideLoaded = false;
            reject(new Error(event.data.error || 'Failed to initialize Pyodide'));
          }
        };

        window.addEventListener('message', onMessage);
        iframe.contentWindow.postMessage({ type: 'start' }, '*');
      })
      .catch((err) => {
        sharedPyodidePromise = null;
        isPyodideLoaded = false;
        reject(err);
      });
  });

  return sharedPyodidePromise;
};

/**
 * Executes Python code inside the Web Worker.
 * Execution timeout (10s) begins ONLY after Pyodide is ready.
 * Infinite loops are terminated using worker.terminate() and a fresh worker is re-armed.
 */
export const runPython = async (code, stdin = '', onProgress = null) => {
  // 1. Ensure Pyodide is loaded first
  if (!isPyodideLoaded) {
    if (onProgress) onProgress('Loading Python runtime...\n');
    await preloadPython();
  }

  return new Promise((resolve) => {
    const MAX_OUTPUT = 100_000;
    let stdout = '';
    let stderr = '';
    let settled = false;

    const runId = 'py-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

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

    let timer = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };

    const finish = (exitCode) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), exitCode });
    };

    // 2. Start the 10-second timeout ONLY now that Pyodide is confirmed ready!
    timer = setTimeout(() => {
      appendStderr('\n[Execution timed out (10s limit)]');
      // Kill the stuck worker and spawn a fresh one
      if (sandboxIframe && sandboxIframe.contentWindow) {
        sandboxIframe.contentWindow.postMessage({ type: 'kill' }, '*');
        isPyodideLoaded = false;
        sharedPyodidePromise = null;
        // Re-arm Pyodide in background so the next run is ready
        preloadPython().catch(() => {});
      }
      finish(124);
    }, 10000);

    const handleMessage = (event) => {
      if (!sandboxIframe || event.source !== sandboxIframe.contentWindow) return;
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'stdout') {
        appendStdout(msg.text);
      } else if (msg.type === 'stderr') {
        appendStderr(msg.text);
      } else if (msg.type === 'done' && msg.id === runId) {
        finish(msg.exitCode ?? 0);
      }
    };

    window.addEventListener('message', handleMessage);

    // 3. Post run command to the sandboxed worker
    sandboxIframe.contentWindow.postMessage({
      type: 'run',
      id: runId,
      code,
      stdin,
      cdnBase: PYODIDE_CDN_BASE
    }, '*');
  });
};
