package com.smartexpense.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String name;

    private String provider;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle")
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Column(name = "next_billing_date", nullable = false)
    private LocalDate nextBillingDate;

    @Column(name = "last_billed_date")
    private LocalDate lastBilledDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private Expense.PaymentMethod paymentMethod = Expense.PaymentMethod.CARD;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 20)
    private String color;

    @Column(name = "remind_days_before")
    private Integer remindDaysBefore = 3;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "auto_renew")
    private Boolean autoRenew = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum BillingCycle { DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY }
    public enum SubscriptionStatus { ACTIVE, PAUSED, CANCELLED }
}
