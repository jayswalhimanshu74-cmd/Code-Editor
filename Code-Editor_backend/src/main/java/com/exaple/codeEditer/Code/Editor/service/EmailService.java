package com.exaple.codeEditer.Code.Editor.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @CircuitBreaker(name = "emailService", fallbackMethod = "fallbackSendPasswordResetEmail")
    @Retry(name = "emailService", fallbackMethod = "fallbackSendPasswordResetEmail")
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.info("Sending password reset email to {}", toEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;
        
        message.setText("To reset your password, please click the link below:\n\n" 
                + resetUrl + "\n\n"
                + "If you did not request this, please ignore this email.");
                
        mailSender.send(message);
    }

    public void fallbackSendPasswordResetEmail(String toEmail, String resetToken, Throwable throwable) {
        log.error("Email Resilience Fallback: Failed to send password reset email to {} due to: {}", toEmail, throwable.getMessage());
    }
}
