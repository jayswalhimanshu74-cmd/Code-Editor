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
            if (onConnected) onConnected();
            return;
        }

        // Removed synchronous token check since token is now an HttpOnly cookie.

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`),



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
        

            // ✅ Refresh token on reconnect attempts
            beforeConnect: () => {
                // Cookies are automatically sent
            },
        });

        this.client.activate();
    }

    subscribe(topic, callback, isBinary = false) {

        if (!this.client) {
            console.warn("[WS] No client — call connect() first");
            return () => {};
        }

        // Already subscribed — return unsubscribe fn
        if (this.subscriptions.has(topic)) {
            console.log("[WS] Already subscribed to", topic);
            return () => {
                const sub = this.subscriptions.get(topic);
                if (sub) {
                    sub.unsubscribe();
                    this.subscriptions.delete(topic);
                }
            };
        }

        const doSubscribe = () => {

            // Double-check to avoid duplicate subscriptions from queue flush
            if (this.subscriptions.has(topic)) return;

            const sub = this.client.subscribe(topic, (message) => {
                if (isBinary) {
                    callback(message.body, message);
                    return;
                }
                try {
                    const parsed = JSON.parse(message.body)
                    callback(parsed,message)
                } catch {
                    callback(message.body,message);
                }
            });

            this.subscriptions.set(topic, sub);
            console.log("[WS] Subscribed to", topic);
        };

        if (this.connected) {
            doSubscribe();
        } else {
            // Queue it — avoid duplicate queued callbacks for same topic
            const alreadyQueued = this.onConnectCallbacks.some(
                cb => cb.topic === topic
            );

            if (!alreadyQueued) {
                doSubscribe.topic = topic;
                this.onConnectCallbacks.push(doSubscribe);
                console.log("[WS] Queued subscription for", topic);
            }
        }

        // Return unsubscribe function
        return () => {
            const sub = this.subscriptions.get(topic);
            if (sub) {
                sub.unsubscribe();
                this.subscriptions.delete(topic);
                console.log("[WS] Unsubscribed from", topic);
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
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions.clear();
        this.onConnectCallbacks = [];
        this.client?.deactivate();
        this.connected = false;
        console.log("[WS] Manually disconnected");
    }

    isConnected() {
        return this.connected;
    }
    // Add inside the WebSocketService class:

    sendBinary(destination, data) {
        if (!this.client?.active || !this.connected) {
            console.warn('[WS] Cannot send binary — not connected');
            return;
        }
     let base64;
    if (typeof data === 'string') {
        base64 = data; // already Base64
    } else {
        // ✅ Fast chunked conversion for large Uint8Arrays
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
                subscription.unsubscribe();
            } catch (err) {
                console.warn('[WS] Unsubscribe error:', err);
            }
        }
    }
}

// Singleton — one shared connection for the whole app
export const wsService = new WebSocketService();