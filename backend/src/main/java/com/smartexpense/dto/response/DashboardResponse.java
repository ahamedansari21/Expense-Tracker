package com.smartexpense.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {

    // Financial Health Score (0-100)
    private Integer financialHealthScore;
    private String healthScoreLabel;
    private String healthScoreTip;

    // This month summary
    private BigDecimal totalExpenses;
    private BigDecimal totalIncome;
    private BigDecimal netSavings;
    private BigDecimal savingsRate;

    // vs last month
    private BigDecimal expenseChangePercent;
    private BigDecimal incomeChangePercent;

    // Charts
    private List<MonthlyTrendPoint> monthlyTrend;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<ExpenseResponse> recentExpenses;

    // Alerts
    private List<BudgetResponse> budgetAlerts;
    private List<SubscriptionResponse> upcomingBills;

    // Goals
    private List<GoalResponse> goals;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyTrendPoint {
        private String month;
        private BigDecimal expenses;
        private BigDecimal income;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryBreakdown {
        private String category;
        private String icon;
        private String color;
        private BigDecimal amount;
        private BigDecimal percentage;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class GoalResponse {
        private Long id;
        private String name;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private BigDecimal progressPercentage;
        private String icon;
        private String color;
    }
}
