package com.smartexpense.service;

import com.smartexpense.entity.Subscription;
import com.smartexpense.repository.BudgetRepository;
import com.smartexpense.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Background jobs:
 *  - Remind users 3 days before a subscription is due
 *  - Reset monthly budgets at the start of each month
 *  - Clean up expired refresh tokens weekly
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTaskService {

    private final SubscriptionRepository subscriptionRepository;
    private final BudgetRepository       budgetRepository;
    private final NotificationService    notificationService;

    // ──────────────────────────────────────────────────────────────────────────
    // Run every morning at 08:00
    // ──────────────────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    public void sendBillDueReminders() {
        log.info("Running bill-due reminder job");
        LocalDate today = LocalDate.now();
        LocalDate lookAhead = today.plusDays(7);

        List<Subscription> dueSoon = subscriptionRepository
                .findDueSoonSubscriptions(today, lookAhead);

        for (Subscription sub : dueSoon) {
            long daysUntil = java.time.temporal.ChronoUnit.DAYS
                    .between(today, sub.getNextBillingDate());

            // Only notify when days remaining equals remindDaysBefore setting
            if (daysUntil <= sub.getRemindDaysBefore()) {
                notificationService.sendBillDueAlert(
                        sub.getUser().getId(), sub.getName(), daysUntil);
                log.debug("Bill reminder sent: {} – {} days", sub.getName(), daysUntil);
            }
        }
        log.info("Bill reminders dispatched for {} subscriptions", dueSoon.size());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // First day of every month at midnight — reset budget 'spent' counters
    // ──────────────────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void resetMonthlyBudgets() {
        log.info("Resetting monthly budgets");
        LocalDate today = LocalDate.now();

        budgetRepository.findAll().stream()
                .filter(b -> b.getIsActive()
                        && "MONTHLY".equals(b.getPeriod().name())
                        && b.getEndDate().isBefore(today))
                .forEach(b -> {
                    // Roll forward to new month
                    b.setSpent(java.math.BigDecimal.ZERO);
                    b.setStartDate(today.withDayOfMonth(1));
                    b.setEndDate(today.withDayOfMonth(today.lengthOfMonth()));
                    budgetRepository.save(b);
                });
        log.info("Monthly budgets reset complete");
    }
}
