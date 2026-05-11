package com.synora.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.public-base-url}")
    private String baseUrl;

    @Async
    public void sendPasswordReset(String toEmail, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        String html = """
                <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0B;color:#EDEDEF;border-radius:12px;">
                  <h2 style="color:#6C5CE7;margin-top:0;">Reset your password</h2>
                  <p style="color:#8B8B8E;">We received a request to reset your Synora password.<br>Click the button below — the link expires in <strong style="color:#EDEDEF;">1 hour</strong>.</p>
                  <a href="%s"
                     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                    Reset password
                  </a>
                  <p style="color:#5C5C63;font-size:12px;">If you didn't request this, ignore this email — your password won't change.</p>
                  <hr style="border:none;border-top:1px solid #222228;margin:24px 0;">
                  <p style="color:#5C5C63;font-size:11px;margin:0;">Synora · %s</p>
                </div>
                """.formatted(resetUrl, baseUrl);

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Reset your Synora password");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reset email to " + toEmail, e);
        }
    }
}
