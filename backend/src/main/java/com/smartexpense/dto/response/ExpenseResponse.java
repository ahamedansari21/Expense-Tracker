package com.smartexpense.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private String type;
    private LocalDate date;
    private LocalTime time;
    private String paymentMethod;
    private String merchant;
    private String location;
    private String receiptUrl;
    private Boolean isRecurring;
    private String recurringInterval;
    private List<String> tags;
    private String notes;
    private Boolean isFraudulent;
    private String fraudReason;
    private BigDecimal aiConfidence;
    private CategoryResponse category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
