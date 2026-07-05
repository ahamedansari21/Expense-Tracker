package com.smartexpense.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private String name;
    private BigDecimal amount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal percentageUsed;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal alertThreshold;
    private Boolean isActive;
    private String color;
    private CategoryResponse category;
    private Boolean isOverBudget;
    private Boolean isNearLimit;
}
