package com.smartexpense.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubscriptionResponse {
    private Long id;
    private String name;
    private String provider;
    private BigDecimal amount;
    private String billingCycle;
    private LocalDate nextBillingDate;
    private LocalDate lastBilledDate;
    private String paymentMethod;
    private String status;
    private String logoUrl;
    private String color;
    private Integer remindDaysBefore;
    private Boolean autoRenew;
    private CategoryResponse category;
    private Long daysUntilBilling;
}
