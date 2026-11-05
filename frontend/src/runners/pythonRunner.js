/**
 * Hardened Client-side Python runner using Pyodide inside a Web Worker
 * hosted within a sandboxed iframe (sandbox="allow-scripts" ONLY).
 *
 * This ensures the execution context has an opaque origin ("null") with
 * zero access to the application's origin, cookies, localStorage, or API credentials.
 * Loads Pyodide lazily on first run from official pinned CDN, enforces a 10s timeout,
 * provides clear guidance if interactive input() is called, and caps output at ~100 KB.
 */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const runPython = (code, stdin = '', onProgress = null) => {
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

    const workerScript = `
      let pyodideInstance = null;

      self.onmessage = async (e) => {
        const { code, stdin, cdnBase } = e.data;

        const postStdout = (text) => self.postMessage({ type: 'stdout', text });
        const postStderr = (text) => self.postMessage({ type: 'stderr', text });

        try {
          if (!pyodideInstance) {
            self.postMessage({ type: 'status', text: 'Loading Python runtime (Pyodide v${PYODIDE_VERSION})...\\n' });
            importScripts(cdnBase + 'pyodide.js');
            pyodideInstance = await loadPyodide({
              indexURL: cdnBase,
            });
            self.postMessage({ type: 'status', text: 'Python runtime initialized successfully.\\n\\n' });
          }

          let stdinQueue = stdin ? stdin.split('\\n') : [];

          pyodideInstance.setStdout({
            batched: (text) => postStdout(text + '\\n')
          });

          pyodideInstance.setStderr({
            batched: (text) => postStderr(text + '\\n')
          });

          pyodideInstance.setStdin({
            read: () => {
              if (stdinQueue.length > 0) {
                return stdinQueue.shift() + '\\n';
              }
              throw new Error('INTERACTIVE_INPUT_CALLED');
            }
          });

          await pyodideInstance.runPythonAsync(code);
          self.postMessage({ type: 'done', exitCode: 0 });
        } catch (err) {
          let msg = err?.message || String(err);
          if (msg.includes('INTERACTIVE_INPUT_CALLED') || msg.includes('StdinNotImplementedError') || msg.includes('input()')) {
            postStderr('\\n[Notice] Interactive input() is not supported in the browser runner. Use the stdin input box or the backend runner.\\n');
          } else {
            postStderr(msg + '\\n');
          }
          self.postMessage({ type: 'done', exitCode: 1 });
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

    window.addEventListener('message', function(event) {
      var data = event.data;
      if (!data || data.type !== 'init') return;
      var id = data.id;

      try {
        var workerContent = ${safeWorkerScript};
        var blob = new Blob([workerContent], { type: 'application/javascript' });
        blobUrl = URL.createObjectURL(blob);
        worker = new Worker(blobUrl);

        worker.onmessage = function(e) {
          window.parent.postMessage(Object.assign({ id: id }, e.data), '*');
        };

        worker.onerror = function(e) {
          window.parent.postMessage({
            id: id,
            type: 'stderr',
            text: 'Python Worker Error: ' + (e.message || 'Unknown runtime error') + '\\n'
          }, '*');
          window.parent.postMessage({ id: id, type: 'done', exitCode: 1 }, '*');
        };

        worker.postMessage({ code: data.code, stdin: data.stdin, cdnBase: data.cdnBase });
      } catch (err) {
        window.parent.postMessage({
          id: id,
          type: 'stderr',
          text: 'Python Sandbox Initialization Error: ' + (err.message || String(err)) + '\\n'
        }, '*');
        window.parent.postMessage({ id: id, type: 'done', exitCode: 1 }, '*');
      }
    });

    window.parent.postMessage({ type: 'iframe_ready' }, '*');
  })();
</script>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.srcdoc = iframeHtml;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const finish = (exitCode) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), exitCode });
    };

    const timer = setTimeout(() => {
      appendStderr('\n[Execution timed out (10s limit)]');
      finish(124);
    }, 10000);

    let sent = false;
    const sendInit = () => {
      if (sent) return;
      if (!iframe.contentWindow) return;
      sent = true;
      iframe.contentWindow.postMessage({
        type: 'init',
        id: runId,
        code,
        stdin,
        cdnBase: PYODIDE_CDN_BASE,
      }, '*');
    };

    const handleMessage = (event) => {
      // Security: Only accept messages from this iframe's contentWindow
      if (event.source !== iframe.contentWindow) return;

      if (event.data?.type === 'iframe_ready') {
        sendInit();
        return;
      }

      // Security: Per-run random id validation
      if (!event.data || event.data.id !== runId) return;

      const msg = event.data;
      if (msg.type === 'status') {
        if (onProgress) onProgress(msg.text);
      } else if (msg.type === 'stdout') {
        appendStdout(msg.text);
      } else if (msg.type === 'stderr') {
        appendStderr(msg.text);
      } else if (msg.type === 'done') {
        finish(msg.exitCode ?? 0);
      }
    };

    window.addEventListener('message', handleMessage);

    iframe.onload = () => {
      sendInit();
    };

    try {
      document.body.appendChild(iframe);
    } catch (err) {
      cleanup();
      return resolve({
        stdout: '',
        stderr: `Failed to attach sandbox iframe: ${err.message}`,
        exitCode: 1,
      });
    }
  });
};
