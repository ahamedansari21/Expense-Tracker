package com.smartexpense.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

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
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private ExpenseType type = ExpenseType.EXPENSE;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime time;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod = PaymentMethod.UPI;

    @Column(length = 255)
    private String merchant;

    @Column(length = 255)
    private String location;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @Column(name = "receipt_public_id", length = 255)
    private String receiptPublicId;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurring_interval")
    private RecurringInterval recurringInterval;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> tags;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "ai_confidence", precision = 5, scale = 2)
    private BigDecimal aiConfidence;

    @Column(name = "ai_category_suggestion", length = 100)
    private String aiCategorySuggestion;

    @Column(name = "is_fraudulent")
    private Boolean isFraudulent = false;

    @Column(name = "fraud_reason", length = 500)
    private String fraudReason;

    @Column(name = "group_id")
    private Long groupId;

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

    public enum ExpenseType { EXPENSE, INCOME }
    public enum PaymentMethod { CASH, CARD, UPI, NET_BANKING, WALLET, OTHER }
    public enum RecurringInterval { DAILY, WEEKLY, MONTHLY, YEARLY }
}
