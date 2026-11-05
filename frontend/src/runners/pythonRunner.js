/**
 * Client-side Python runner using Pyodide inside a Web Worker.
 * Loads Pyodide lazily on first Python run from official pinned CDN,
 * captures stdout/stderr, enforces a 10s execution timeout,
 * provides clear guidance if interactive input() is used,
 * and caps output at ~100 KB.
 */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const runPython = (code, stdin = '', onProgress = null) => {
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

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker;

    try {
      worker = new Worker(workerUrl);
    } catch (err) {
      URL.revokeObjectURL(workerUrl);
      return resolve({
        stdout: '',
        stderr: `Failed to initialize Python Web Worker: ${err.message}`,
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
      appendStderr('\n[Execution timed out (10s limit)]');
      finish(124);
    }, 10000);

    worker.onmessage = (event) => {
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

    worker.onerror = (err) => {
      appendStderr(`Python Worker Error: ${err.message || 'Worker error'}\n`);
      finish(1);
    };

    worker.postMessage({ code, stdin, cdnBase: PYODIDE_CDN_BASE });
  });
};

