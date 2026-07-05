package com.smartexpense.controller;

import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.dto.response.SubscriptionResponse;
import com.smartexpense.entity.User;
import com.smartexpense.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getSubscriptions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                subscriptionService.getSubscriptionsForUser(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> create(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        SubscriptionResponse sub = subscriptionService.createSubscription(user.getId(), request);
        return ResponseEntity.status(201).body(ApiResponse.success("Subscription added", sub));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                subscriptionService.updateStatus(user.getId(), id, body.get("status"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        subscriptionService.deleteSubscription(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Subscription deleted", null));
    }
}
