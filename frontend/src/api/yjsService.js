import * as Y from 'yjs';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { wsService } from './websocketService';
import api from './axios';

const docs = new Map();
const awarenesses = new Map();
const cleanups = new Map();

window.addEventListener('beforeunload', () => {
  for (const [, info] of cleanups.entries()) {
    if (info.flush) {
      info.flush(true);
    }
  }
});

const fetchStateWithRetry = async (url, maxRetries = 3, baseDelay = 1000) => {
  let attempt = 0;
  while (true) {
    try {
      const res = await api.get(url, {
        responseType: 'text',
        timeout: 10000,
      });
      return res.data;
    } catch (err) {
      attempt++;
      console.warn(`[Yjs] State fetch attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const yjsService = {

  getDoc(roomId) {
    if (!docs.has(roomId)) docs.set(roomId, new Y.Doc());
    return docs.get(roomId);
  },

  getFileDoc(roomId, fileId) {
    const key = `${roomId}:${fileId}`;
    if (!docs.has(key)) docs.set(key, new Y.Doc());
    return docs.get(key);
  },

  getAwareness(roomId, fileId = null) {
    const key = fileId ? `${roomId}:${fileId}` : roomId;
    if (!awarenesses.has(key)) {
      const doc = fileId ? this.getFileDoc(roomId, fileId) : this.getDoc(roomId);
      awarenesses.set(key, new Awareness(doc));
    }
    return awarenesses.get(key);
  },

  /**
   * Sequence:
   * 1. Create Y.Doc and Y.Text.
   * 2. Subscribe to STOMP topic FIRST and buffer incoming updates in a queue.
   * 3. Fetch saved state with loading & retry/backoff, and apply using Y.applyUpdate(ydoc, update, "remote").
   * 4. Flush buffered updates.
   * 5. Document ready for MonacoBinding.
   */
  async connect(roomId, fileId = null) {
    const key = fileId ? `${roomId}:${fileId}` : roomId;

    // 1. Create the Y.Doc and Y.Text
    const doc = new Y.Doc();
    const ytext = doc.getText('monaco');
    docs.set(key, doc);

    const topic = fileId
      ? `/topic/yjs/${roomId}/file/${fileId}`
      : `/topic/yjs/${roomId}`;
    const sendTo = fileId
      ? `/app/yjs/${roomId}/file/${fileId}/update`
      : `/app/yjs/${roomId}/update`;
    const awareTopic = `${topic}/awareness`;
    const awareSendTo = `${sendTo.replace('/update', '/awareness')}`;
    const endpointPath = fileId
      ? `/yjs/${roomId}/file/${fileId}`
      : `/yjs/${roomId}`;

    // 2. Subscribe to STOMP topic FIRST and buffer incoming updates in a queue
    const updateQueue = [];
    let isHydrated = false;

    const sub = wsService.subscribe(topic, (data) => {
      try {
        if (typeof data === 'string' && data.length > 0) {
          const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          if (binary.length > 0) {
            if (!isHydrated) {
              updateQueue.push(binary);
            } else {
              Y.applyUpdate(doc, binary, wsService);
            }
          }
        }
      } catch (err) {
        console.error('[Yjs] Failed to apply remote update:', err);
      }
    }, true);

    // 3. Fetch the saved state, with retry/backoff, and apply using Y.applyUpdate(ydoc, update, "remote")
    const base64Data = await fetchStateWithRetry(endpointPath);
    if (base64Data && typeof base64Data === 'string' && base64Data.trim().length > 0) {
      try {
        const binary = Uint8Array.from(atob(base64Data.trim()), c => c.charCodeAt(0));
        if (binary.length > 0) {
          Y.applyUpdate(doc, binary, 'remote');
        }
      } catch (decodeErr) {
        console.error('[Yjs] Failed to decode initial state:', decodeErr);
      }
    }

    // 4. Flush the buffered updates (Yjs merges duplicates safely)
    while (updateQueue.length > 0) {
      const bufferedUpdate = updateQueue.shift();
      try {
        Y.applyUpdate(doc, bufferedUpdate, wsService);
      } catch (err) {
        console.error('[Yjs] Failed to apply buffered update:', err);
      }
    }
    isHydrated = true;

    // 5. Send local doc updates & debounce persistence to database
    let debounceTimeout = null;

    const flushSave = async () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
      }
      try {
        const fullState = Y.encodeStateAsUpdate(doc);
        let binaryString = '';
        const bytes = new Uint8Array(fullState);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binaryString);

        await api.post(`${endpointPath}/state`, base64, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 10000,
        });
        console.log('[Yjs] Full state persisted to database for key:', key);
      } catch (err) {
        console.error('[Yjs] Failed to persist full state to DB:', err);
      }
    };

    const observer = (update, origin) => {
      try {
        wsService.sendBinary(sendTo, update);
        if (origin !== wsService) {
          if (debounceTimeout) clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(async () => {
            await flushSave();
          }, 2000);
        }
      } catch (err) {
        console.error('[Yjs] Failed to send update:', err);
      }
    };
    doc.on('update', observer);

    // Awareness — cursor positions
    const awareness = this.getAwareness(roomId, fileId);

    const awareSub = wsService.subscribe(awareTopic, (data) => {
      try {
        if (typeof data === 'string' && data.length > 0) {
          const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          applyAwarenessUpdate(awareness, binary, null);
        }
      } catch (err) {
        console.error('[Yjs] Failed to apply awareness update:', err);
      }
    }, true);

    const awareObserver = ({ added, updated, removed }) => {
      try {
        const changedClients = [...added, ...updated, ...removed];
        const update = encodeAwarenessUpdate(awareness, changedClients);
        wsService.sendBinary(awareSendTo, update);
      } catch (err) {
        console.error('[Yjs] Failed to send awareness:', err);
      }
    };
    awareness.on('change', awareObserver);

    // Re-fetch the state after a reconnect to cover missed updates
    const unsubReconnect = wsService.onReconnect(async () => {
      console.log('[Yjs] STOMP reconnected — re-fetching state to cover missed updates for', key);
      try {
        const catchupBase64 = await fetchStateWithRetry(endpointPath, 2, 1000);
        if (catchupBase64 && typeof catchupBase64 === 'string' && catchupBase64.trim().length > 0) {
          const binary = Uint8Array.from(atob(catchupBase64.trim()), c => c.charCodeAt(0));
          if (binary.length > 0) {
            Y.applyUpdate(doc, binary, 'remote');
            console.log('[Yjs] Successfully applied catchup state on reconnect for', key);
          }
        }
      } catch (reErr) {
        console.warn('[Yjs] Failed to catch up state on reconnect for', key, reErr);
      }
    });

    cleanups.set(key, {
      unsub: sub,
      awareUnsub: awareSub,
      unsubReconnect,
      observer,
      awareObserver,
      doc,
      awareness,
      flush: async () => {
        if (debounceTimeout) {
          await flushSave();
        }
      }
    });

    return { doc, ytext, awareness };
  },

  getAwarenessForRoom(roomId, fileId = null) {
    const key = fileId ? `${roomId}:${fileId}` : roomId;
    return awarenesses.get(key) || null;
  },

  async disconnect(roomId, fileId = null) {
    const key = fileId ? `${roomId}:${fileId}` : roomId;
    const info = cleanups.get(key);
    if (info) {
      if (info.flush) {
        await info.flush();
      }
      info.doc.off('update', info.observer);
      info.awareness?.off('change', info.awareObserver);
      if (typeof info.unsub === 'function') info.unsub();
      if (typeof info.awareUnsub === 'function') info.awareUnsub();
      if (typeof info.unsubReconnect === 'function') info.unsubReconnect();
      cleanups.delete(key);
    }
    docs.delete(key);
    awarenesses.delete(key);
  },
};
