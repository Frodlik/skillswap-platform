package com.skillswap.moderationservice.messaging;

import com.skillswap.moderationservice.config.RabbitMqConfig;
import com.skillswap.moderationservice.event.SessionReportSubmittedEvent;
import com.skillswap.moderationservice.service.ReportService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class SessionReportListener {

    private static final Logger log = LoggerFactory.getLogger(SessionReportListener.class);
    private final ReportService reportService;

    @RabbitListener(queues = RabbitMqConfig.SESSION_REPORT_QUEUE)
    public void handleReportSubmitted(SessionReportSubmittedEvent event) {
        log.info("Received session.report-submitted sourceId={}", event.sessionReportId());
        reportService.createFromEvent(event);
    }
}
