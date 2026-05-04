package com.skillswap.notificationservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;

// Renders a Thymeleaf template under templates/email/<name>.html and ships
// the resulting HTML to SMTP. We catch (and log) MailException so a broken
// SMTP doesn't NACK the AMQP message back to the broker — losing one
// notification email is far better than blocking the queue.
@Service
@AllArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${notifications.from-email:noreply@skillswap.dev}")
    private String fromEmail;

    public void send(String to, String subject, String templateName, Map<String, Object> model) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping email '{}': no recipient address", subject);
            return;
        }
        try {
            Context ctx = new Context();
            model.forEach(ctx::setVariable);
            String html = templateEngine.process("email/" + templateName, ctx);

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mime);
            log.info("Sent '{}' to {}", subject, to);
        } catch (MessagingException | MailException ex) {
            // Don't rethrow — losing one email is not worth dead-lettering
            // the upstream domain event.
            log.error("Failed to send '{}' to {}: {}", subject, to, ex.getMessage());
        }
    }
}
