/**
 * Hardened Client-side JavaScript runner.
 * Runs user code in a Web Worker inside a hidden sandboxed iframe
 * with sandbox="allow-scripts" ONLY (no allow-same-origin).
 *
 * This ensures the execution context has an opaque origin ("null") with
 * zero access to the application's origin, cookies, localStorage, or API credentials.
 */

export const runJs = (code, stdin = '') => {
  return new Promise((resolve) => {
    const MAX_OUTPUT = 100_000;
    let stdout = '';
    let stderr = '';
    let settled = false;

    const runId = 'js-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

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

    // Code executed inside the isolated Web Worker
    const workerScript = `
      self.onmessage = async (e) => {
        const { code } = e.data;
        const formatArg = (arg) => {
          if (typeof arg === 'object' && arg !== null) {
            try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }
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

    const safeWorkerScript = JSON.stringify(workerScript).replace(/<\/script/gi, '<\\/script');

    // Sandboxed iframe HTML using srcdoc
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
            text: 'Worker Error: ' + (e.message || 'Unknown runtime error') + '\\n'
          }, '*');
          window.parent.postMessage({ id: id, type: 'done', exitCode: 1 }, '*');
        };

        worker.postMessage({ code: data.code, stdin: data.stdin });
      } catch (err) {
        window.parent.postMessage({
          id: id,
          type: 'stderr',
          text: 'Sandbox Initialization Error: ' + (err.message || String(err)) + '\\n'
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
      appendStderr('\n[Execution timed out (5s limit)]');
      finish(124);
    }, 5000);

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
      if (msg.type === 'stdout') {
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
