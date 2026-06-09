import * as Y from 'yjs';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { wsService } from './websocketService';

const docs = new Map();
const awarenesses = new Map();
const cleanups = new Map();

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

  async connect(roomId, fileId = null) {
    const key     = fileId ? `${roomId}:${fileId}` : roomId;
    const doc     = fileId ? this.getFileDoc(roomId, fileId) : this.getDoc(roomId);
    const topic   = fileId
      ? `/topic/yjs/${roomId}/file/${fileId}`
      : `/topic/yjs/${roomId}`;
    const sendTo  = fileId
      ? `/app/yjs/${roomId}/file/${fileId}/update`
      : `/app/yjs/${roomId}/update`;
    const awareTopic  = `${topic}/awareness`;
    const awareSendTo = `${sendTo.replace('/update', '/awareness')}`;
    const restUrl = fileId
      ? `${import.meta.env.VITE_API_URL}/api/yjs/${roomId}/file/${fileId}`
      : `${import.meta.env.VITE_API_URL}/api/yjs/${roomId}`;

    // 1. Load initial state
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(restUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const base64 = await res.text();
        if (base64) {
          const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          Y.applyUpdate(doc, binary);
        }
      }
    } catch (err) {
      console.warn('[Yjs] Could not load initial state:', err);
    }

    // 2. Subscribe to doc updates
    const sub = wsService.subscribe(topic, (data) => {
      try {
        if (typeof data === 'string' && data.length > 0) {
          const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          if (binary.length > 0) Y.applyUpdate(doc, binary);
        }
      } catch (err) {
        console.error('[Yjs] Failed to apply remote update:', err);
      }
    }, true);
    console.log('[Yjs] sub type after subscribe:', typeof sub, sub);

    // 3. Send local doc updates
    const observer = (update) => {
      try {
       
        wsService.sendBinary(sendTo,update);
      } catch (err) {
        console.error('[Yjs] Failed to send update:', err);
      }
    };
    doc.on('update', observer);

    // 4. Awareness — cursor positions
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
        wsService.sendBinary(awareSendTo, update); // ✅ pass Uint8Array directly
      } catch (err) {
        console.error('[Yjs] Failed to send awareness:', err);
      }
    };
    awareness.on('change', awareObserver);

cleanups.set(key, { unsub: sub, awareUnsub: awareSub, observer, awareObserver, doc, awareness });
console.log('[Yjs] cleanup stored, unsub type:', typeof sub, 'awareUnsub type:', typeof awareSub);
    return doc;
  },

  getAwarenessForRoom(roomId, fileId = null) {
    const key = fileId ? `${roomId}:${fileId}` : roomId;
    return awarenesses.get(key) || null;
  },

  disconnect(roomId, fileId = null) {
    const key = fileId ? `${roomId}:${fileId}` : roomId;
    const info = cleanups.get(key);
    if (info) {
      info.doc.off('update', info.observer);
      info.awareness?.off('change', info.awareObserver);
      if (typeof info.unsub === 'function') info.unsub();      // ✅
      if (typeof info.awareUnsub === 'function') info.awareUnsub(); // ✅
      cleanups.delete(key);
    }
    docs.delete(key);
    awarenesses.delete(key);
  },
};