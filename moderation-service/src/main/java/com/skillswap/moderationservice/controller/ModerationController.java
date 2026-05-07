package com.skillswap.moderationservice.controller;

import com.skillswap.moderationservice.client.SkillServiceClient;
import com.skillswap.moderationservice.client.UserServiceClient;
import com.skillswap.moderationservice.domain.ContentReportStatus;
import com.skillswap.moderationservice.domain.SanctionType;
import com.skillswap.moderationservice.dto.request.CreateSanctionRequest;
import com.skillswap.moderationservice.dto.request.ModeratorProfilePatchRequest;
import com.skillswap.moderationservice.dto.response.ReportResponse;
import com.skillswap.moderationservice.dto.response.SanctionResponse;
import com.skillswap.moderationservice.service.ReportService;
import com.skillswap.moderationservice.service.SanctionService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/moderation")
@AllArgsConstructor
public class ModerationController {

    private final SanctionService sanctionService;
    private final ReportService reportService;
    private final SkillServiceClient skillClient;
    private final UserServiceClient userClient;

    // ---- Sanctions ----

    @PostMapping("/sanctions")
    @ResponseStatus(HttpStatus.CREATED)
    SanctionResponse createSanction(
            @Valid @RequestBody CreateSanctionRequest request,
            @RequestHeader("x-user-id") UUID moderatorId) {
        return sanctionService.create(request, moderatorId);
    }

    @GetMapping("/sanctions")
    List<SanctionResponse> listSanctions(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) SanctionType type) {
        return sanctionService.list(userId, type);
    }

    @DeleteMapping("/sanctions/{sanctionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void liftSanction(@PathVariable UUID sanctionId,
                       @RequestHeader("x-user-id") UUID moderatorId) {
        sanctionService.lift(sanctionId, moderatorId);
    }

    @GetMapping("/users/{userId}/sanctions")
    List<SanctionResponse> getUserSanctions(@PathVariable UUID userId) {
        return sanctionService.list(userId, null);
    }

    // ---- Reports ----

    @GetMapping("/reports")
    List<ReportResponse> listReports(
            @RequestParam(required = false) ContentReportStatus status) {
        return reportService.list(status);
    }

    @PostMapping("/reports/{reportId}/resolve")
    ReportResponse resolveReport(@PathVariable UUID reportId,
                                  @RequestHeader("x-user-id") UUID moderatorId) {
        return reportService.resolve(reportId, moderatorId);
    }

    @PostMapping("/reports/{reportId}/dismiss")
    ReportResponse dismissReport(@PathVariable UUID reportId,
                                  @RequestHeader("x-user-id") UUID moderatorId) {
        return reportService.dismiss(reportId, moderatorId);
    }

    // ---- Content Management ----

    @DeleteMapping("/skills/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteSkill(@PathVariable UUID skillId) {
        skillClient.deleteSkill(skillId);
    }

    @PatchMapping("/users/{userId}/profile")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void patchProfile(@PathVariable UUID userId,
                       @Valid @RequestBody ModeratorProfilePatchRequest request) {
        userClient.patchProfile(userId, request);
    }
}
