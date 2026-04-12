package com.synora.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();      // fallback для браузеров без WS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Префикс для входящих сообщений от клиента
        registry.setApplicationDestinationPrefixes("/app");

        // In-memory брокер (замени на /topic + Redis pub/sub при масштабировании)
        registry.enableSimpleBroker(
                "/topic",   // broadcast (чат комнаты, лента)
                "/queue"    // point-to-point (личные уведомления)
        );

        // Личная очередь пользователя: /user/{username}/queue/...
        registry.setUserDestinationPrefix("/user");
    }
}
