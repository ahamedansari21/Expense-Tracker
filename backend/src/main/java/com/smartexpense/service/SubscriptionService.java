package com.smartexpense.service;

import com.smartexpense.dto.response.CategoryResponse;
import com.smartexpense.dto.response.SubscriptionResponse;
import com.smartexpense.entity.Category;
import com.smartexpense.entity.Subscription;
import com.smartexpense.entity.User;
import com.smartexpense.exception.ResourceNotFoundException;
import com.smartexpense.repository.CategoryRepository;
import com.smartexpense.repository.SubscriptionRepository;
import com.smartexpense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;

    public List<SubscriptionResponse> getSubscriptionsForUser(Long userId) {
        return subscriptionRepository.findByUserIdOrderByNextBillingDateAsc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public SubscriptionResponse createSubscription(Long userId, Map<String, Object> request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Subscription subscription = Subscription.builder()
                .user(user)
                .name(request.get("name").toString())
                .provider(request.getOrDefault("provider", "").toString())
                .amount(new BigDecimal(request.get("amount").toString()))
                .billingCycle(Subscription.BillingCycle.valueOf(
                        request.getOrDefault("billingCycle", "MONTHLY").toString()))
                .nextBillingDate(LocalDate.parse(request.get("nextBillingDate").toString()))
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .color(request.getOrDefault("color", "#6C5CE7").toString())
                .remindDaysBefore(Integer.parseInt(request.getOrDefault("remindDaysBefore", "3").toString()))
                .build();

        if (request.containsKey("categoryId") && request.get("categoryId") != null) {
            categoryRepository.findById(Long.parseLong(request.get("categoryId").toString()))
                    .ifPresent(subscription::setCategory);
        }

        return mapToResponse(subscriptionRepository.save(subscription));
    }

    @Transactional
    public SubscriptionResponse updateStatus(Long userId, Long id, String status) {
        Subscription sub = subscriptionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        sub.setStatus(Subscription.SubscriptionStatus.valueOf(status));
        return mapToResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public void deleteSubscription(Long userId, Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        subscriptionRepository.delete(sub);
    }

    public BigDecimal getMonthlySubscriptionTotal(Long userId) {
        return subscriptionRepository.getTotalMonthlySubscriptionCost(userId);
    }

    private SubscriptionResponse mapToResponse(Subscription sub) {
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), sub.getNextBillingDate());
        CategoryResponse catResp = sub.getCategory() != null
                ? expenseService.mapCategoryToResponse(sub.getCategory()) : null;

        return SubscriptionResponse.builder()
                .id(sub.getId())
                .name(sub.getName())
                .provider(sub.getProvider())
                .amount(sub.getAmount())
                .billingCycle(sub.getBillingCycle().name())
                .nextBillingDate(sub.getNextBillingDate())
                .lastBilledDate(sub.getLastBilledDate())
                .paymentMethod(sub.getPaymentMethod() != null ? sub.getPaymentMethod().name() : null)
                .status(sub.getStatus().name())
                .logoUrl(sub.getLogoUrl())
                .color(sub.getColor())
                .remindDaysBefore(sub.getRemindDaysBefore())
                .autoRenew(sub.getAutoRenew())
                .category(catResp)
                .daysUntilBilling(daysUntil)
                .build();
    }
}
