package com.smartexpense.dto.request;

import com.smartexpense.entity.Expense;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ExpenseRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @DecimalMax(value = "9999999.99", message = "Amount too large")
    private BigDecimal amount;

    private Expense.ExpenseType type = Expense.ExpenseType.EXPENSE;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime time;

    private Expense.PaymentMethod paymentMethod = Expense.PaymentMethod.UPI;

    private Long categoryId;

    private String merchant;

    private String location;

    private Boolean isRecurring = false;

    private Expense.RecurringInterval recurringInterval;

    private List<String> tags;

    private String notes;
}
