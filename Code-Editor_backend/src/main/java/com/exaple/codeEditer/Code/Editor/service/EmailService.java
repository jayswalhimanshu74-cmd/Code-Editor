package com.exaple.codeEditer.Code.Editor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        
        // Assuming your frontend runs on localhost:5173
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;
        
        message.setText("To reset your password, please click the link below:\n\n" 
                + resetUrl + "\n\n"
                + "If you did not request this, please ignore this email.");
                
        mailSender.send(message);
    }
}
