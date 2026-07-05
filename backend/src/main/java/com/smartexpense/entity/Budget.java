package com.smartexpense.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget {

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

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(precision = 15, scale = 2)
    private BigDecimal spent = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private BudgetPeriod period = BudgetPeriod.MONTHLY;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "alert_threshold", precision = 5, scale = 2)
    private BigDecimal alertThreshold = new BigDecimal("80.00");

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(length = 20)
    private String color;

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

    /** Convenience: percentage of budget used */
    @Transient
    public BigDecimal getPercentageUsed() {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return spent.multiply(new BigDecimal("100")).divide(amount, 2, java.math.RoundingMode.HALF_UP);
    }

    public enum BudgetPeriod { WEEKLY, MONTHLY, QUARTERLY, YEARLY }
}
