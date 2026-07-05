package com.smartexpense.service;

import com.smartexpense.entity.Budget;
import com.smartexpense.entity.Notification;
import com.smartexpense.entity.User;
import com.smartexpense.repository.NotificationRepository;
import com.smartexpense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Async
    @Transactional
    public void sendBudgetAlert(Long userId, Budget budget) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        String title = budget.getSpent().compareTo(budget.getAmount()) >= 0
                ? "⚠️ Budget Exceeded!"
                : "🔔 Budget Alert";
        String message = String.format(
                "Your \"%s\" budget has reached %.0f%% of the ₹%.0f limit.",
                budget.getName(), budget.getPercentageUsed().doubleValue(), budget.getAmount().doubleValue());

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(Notification.NotificationType.BUDGET_ALERT)
                .metadata(Map.of("budgetId", budget.getId()))
                .build();

        notificationRepository.save(notification);
    }

    @Async
    @Transactional
    public void sendBillDueAlert(Long userId, String subscriptionName, long daysUntil) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .title("📅 Bill Due Soon")
                .message(String.format("Your \"%s\" subscription is due in %d day(s).", subscriptionName, daysUntil))
                .type(Notification.NotificationType.BILL_DUE)
                .build();

        notificationRepository.save(notification);
    }

    @Async
    @Transactional
    public void sendFraudAlert(Long userId, String expenseTitle, String reason) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .title("🚨 Suspicious Transaction Detected")
                .message(String.format("Unusual activity on \"%s\": %s", expenseTitle, reason))
                .type(Notification.NotificationType.FRAUD_ALERT)
                .build();

        notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Long userId, int page, int size) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .getContent();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
