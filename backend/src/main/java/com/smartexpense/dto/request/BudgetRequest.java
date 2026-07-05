package com.smartexpense.dto.request;

import com.smartexpense.entity.Budget;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BudgetRequest {

    @NotBlank(message = "Budget name is required")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00")
    private BigDecimal amount;

    private Long categoryId;

    private Budget.BudgetPeriod period = Budget.BudgetPeriod.MONTHLY;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private BigDecimal alertThreshold = new BigDecimal("80.00");

    private String color;
}
