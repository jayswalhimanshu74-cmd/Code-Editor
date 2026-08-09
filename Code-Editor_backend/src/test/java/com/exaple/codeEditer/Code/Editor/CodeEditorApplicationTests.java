package com.exaple.codeEditer.Code.Editor;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CodeEditorApplicationTests {

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String clientSecret;

	@Test
	void contextLoads() {
        assertFalse(clientId.isBlank(), "GitHub Client ID is missing!");
        assertFalse(clientSecret.isBlank(), "GitHub Client Secret is missing!");
	}

}
