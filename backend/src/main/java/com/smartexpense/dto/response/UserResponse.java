package com.smartexpense.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String currency;
    private BigDecimal monthlyIncome;
    private String role;
    private String provider;
    private Boolean notificationEnabled;
    private String themePreference;
    private LocalDateTime createdAt;
}
