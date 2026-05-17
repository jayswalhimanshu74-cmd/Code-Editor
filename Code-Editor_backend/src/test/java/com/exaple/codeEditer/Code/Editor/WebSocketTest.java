package com.exaple.codeEditer.Code.Editor;


import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebSocketTest {

    @LocalServerPort
    private int port;

    @Test
    public void testWebSocketConnection() throws Exception {
        CountDownLatch latch = new CountDownLatch(1);

        var client = new SockJsClient(
                List.of(new WebSocketTransport(new StandardWebSocketClient()))
        );
        var stompClient = new WebSocketStompClient(client);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        stompClient.connectAsync(
                "ws://localhost:" + port + "/ws",
                new StompSessionHandlerAdapter() {
                    @Override
                    public void afterConnected(StompSession session,
                                               StompHeaders headers) {
                        System.out.println("Connected!");
                        latch.countDown();
                    }
                    @Override
                    public void handleTransportError(StompSession session,
                                                     Throwable ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                }
        );

        assertTrue(latch.await(5, TimeUnit.SECONDS), "WS connection timed out");
    }
}