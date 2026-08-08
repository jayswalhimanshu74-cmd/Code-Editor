import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {

    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.connected = false;
        this.onConnectCallbacks = [];
    }

    connect(onConnected, onDisconnected) {

        if (this.client?.active || this.connected) {
            console.log("[WS] Already connected");
            if (onConnected && this.connected) onConnected();
            return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${baseUrl}/ws`),

            reconnectDelay: 5000,
            debug: (str) => console.log("[WS DEBUG]", str),

            onConnect: () => {
                this.connected = true;
                console.log("[WS] Connected to server");

                // Flush all queued subscriptions
                this.onConnectCallbacks.forEach(cb => cb());
                this.onConnectCallbacks = [];

                if (onConnected) onConnected();
            },

            onDisconnect: () => {
                this.connected = false;
                console.log("[WS] Disconnected from server");
                if (onDisconnected) onDisconnected();
            },

            onStompError: (frame) => {
                console.error('[WS] STOMP error frame:', frame);
                console.error('[WS] STOMP error message:', frame.headers?.message);
                console.error('[WS] STOMP error body:', frame.body);
            },

            beforeConnect: () => {
                // Cookies are automatically sent
            },
        });

        this.client.activate();
    }

    subscribe(topic, callback, isBinary = false) {
        if (!callback || typeof callback !== 'function') {
            return () => {};
        }

        let entry = this.subscriptions.get(topic);

        if (!entry) {
            entry = {
                stompSub: null,
                listeners: new Set(),
                isBinary: isBinary
            };
            this.subscriptions.set(topic, entry);
        }

        entry.listeners.add(callback);

        const setupStompSub = () => {
            if (!this.client || entry.stompSub) return;

            const stompSub = this.client.subscribe(topic, (message) => {
                let parsed;
                if (entry.isBinary) {
                    parsed = message.body;
                } else {
                    try {
                        parsed = JSON.parse(message.body);
                    } catch {
                        parsed = message.body;
                    }
                }
                entry.listeners.forEach((cb) => {
                    try {
                        cb(parsed, message);
                    } catch (err) {
                        console.error("[WS] Listener callback error:", err);
                    }
                });
            });

            entry.stompSub = stompSub;
            console.log("[WS] STOMP Subscribed to", topic);
        };

        if (this.connected && this.client) {
            setupStompSub();
        } else {
            const alreadyQueued = this.onConnectCallbacks.some(
                cb => cb.topic === topic
            );
            if (!alreadyQueued) {
                const queueCb = () => {
                    const currentEntry = this.subscriptions.get(topic);
                    if (currentEntry && currentEntry.listeners.size > 0) {
                        setupStompSub();
                    }
                };
                queueCb.topic = topic;
                this.onConnectCallbacks.push(queueCb);
                console.log("[WS] Queued subscription for", topic);
            }
        }

        // Return unsubscribe function for this specific listener
        return () => {
            const currentEntry = this.subscriptions.get(topic);
            if (!currentEntry) return;

            currentEntry.listeners.delete(callback);
            console.log(`[WS] Unregistered listener for ${topic} (remaining: ${currentEntry.listeners.size})`);

            if (currentEntry.listeners.size === 0) {
                if (currentEntry.stompSub) {
                    try {
                        currentEntry.stompSub.unsubscribe();
                    } catch (err) {
                        console.warn("[WS] Error unsubscribing STOMP sub:", err);
                    }
                }
                this.subscriptions.delete(topic);
                console.log("[WS] Unsubscribed STOMP channel for", topic);
            }
        };
    }

    publish(destination, body) {
        if (this.client?.connected) {
            this.client.publish({
                destination,
                body: JSON.stringify(body),
            });
        } else {
            console.warn("[WS] Not connected — cannot publish to", destination);
        }
    }

    disconnect() {
        this.subscriptions.forEach((entry, topic) => {
            if (entry.stompSub) {
                try {
                    entry.stompSub.unsubscribe();
                } catch (err) {
                    console.warn(`[WS] Error unsubscribing topic ${topic}:`, err);
                }
            }
        });
        this.subscriptions.clear();
        this.onConnectCallbacks = [];
        if (this.client) {
            try {
                this.client.deactivate();
            } catch (err) {
                console.warn('[WS] Error deactivating client:', err);
            }
            this.client = null;
        }
        this.connected = false;
        console.log("[WS] Manually disconnected");
    }

    isConnected() {
        return this.connected;
    }

    sendBinary(destination, data) {
        if (!this.client?.active || !this.connected) {
            console.warn('[WS] Cannot send binary — not connected');
            return;
        }
        let base64;
        if (typeof data === 'string') {
            base64 = data;
        } else {
            let binary = '';
            const bytes = new Uint8Array(data);
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
            }
            base64 = btoa(binary);
        }
        this.client.publish({
            destination,
            body: base64,
            headers: {
                "content-type": "text/plain",
            },
        });
    }

    unsubscribe(subscription) {
        if (subscription) {
            try {
                if (typeof subscription === 'function') {
                    subscription();
                } else if (subscription.unsubscribe) {
                    subscription.unsubscribe();
                }
            } catch (err) {
                console.warn('[WS] Unsubscribe error:', err);
            }
        }
    }
}

// Singleton — one shared connection for the whole app
export const wsService = new WebSocketService();