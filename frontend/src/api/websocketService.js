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

        // ✅ Guard — don't connect without a token
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.warn("[WS] No access token found — aborting connect");
            return;
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`),

            // ✅ Read token at connect time (not at class instantiation time)
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },

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
                console.error("[WS] STOMP error:", frame);
            },

            // ✅ Refresh token on reconnect attempts
            beforeConnect: () => {
                this.client.connectHeaders = {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                };
            },
        });

        this.client.activate();
    }

    subscribe(topic, callback) {

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
                try {
                    callback(JSON.parse(message.body));
                } catch {
                    callback(message.body);
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
}

// Singleton — one shared connection for the whole app
export const wsService = new WebSocketService();