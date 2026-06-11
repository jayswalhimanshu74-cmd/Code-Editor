package com.exaple.codeEditer.Code.Editor.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class GitHubTokenEncryptor {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;

    private final SecretKeySpec secretKey;

    public GitHubTokenEncryptor(@Value("${github.token.encryption.key}") String encryptionKey) {
        if (encryptionKey == null || encryptionKey.length() < 32) {
            throw new IllegalArgumentException("GitHub token encryption key must be at least 32 characters long.");
        }
        byte[] keyBytes = encryptionKey.substring(0, 32).getBytes(StandardCharsets.UTF_8);
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plaintext) {
        if (plaintext == null) return null;
        try {
            byte[] iv = new byte[IV_LENGTH_BYTE];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

            byte[] cipherText = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            byte[] message = new byte[IV_LENGTH_BYTE + cipherText.length];
            System.arraycopy(iv, 0, message, 0, IV_LENGTH_BYTE);
            System.arraycopy(cipherText, 0, message, IV_LENGTH_BYTE, cipherText.length);

            return Base64.getEncoder().encodeToString(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt GitHub token", e);
        }
    }

    public String decrypt(String ciphertext) {
        if (ciphertext == null) return null;
        try {
            byte[] message = Base64.getDecoder().decode(ciphertext);

            if (message.length < IV_LENGTH_BYTE) {
                throw new IllegalArgumentException("Invalid ciphertext format");
            }

            byte[] iv = new byte[IV_LENGTH_BYTE];
            System.arraycopy(message, 0, iv, 0, IV_LENGTH_BYTE);

            byte[] actualCipherText = new byte[message.length - IV_LENGTH_BYTE];
            System.arraycopy(message, IV_LENGTH_BYTE, actualCipherText, 0, actualCipherText.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

            byte[] plainText = cipher.doFinal(actualCipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt GitHub token", e);
        }
    }
}
