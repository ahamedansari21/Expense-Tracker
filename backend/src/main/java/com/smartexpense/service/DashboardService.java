package com.smartexpense.service;

import com.smartexpense.ai.GeminiService;
import com.smartexpense.dto.response.*;
import com.smartexpense.entity.*;
import com.smartexpense.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final FinancialGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final GeminiService geminiService;
    private final ExpenseService expenseService;
    private final BudgetService budgetService;
    private final SubscriptionService subscriptionService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);

        // Monthly totals
        BigDecimal totalExpenses = Optional.ofNullable(
            expenseRepository.sumExpensesByUserAndDateRange(userId, startOfMonth, endOfMonth)
        ).orElse(BigDecimal.ZERO);

        BigDecimal totalIncome = Optional.ofNullable(
            expenseRepository.sumIncomeByUserAndDateRange(userId, startOfMonth, endOfMonth)
        ).orElse(BigDecimal.ZERO);

        BigDecimal lastMonthExpenses = Optional.ofNullable(
            expenseRepository.sumExpensesByUserAndDateRange(userId, startOfLastMonth, endOfLastMonth)
        ).orElse(BigDecimal.ZERO);

        BigDecimal lastMonthIncome = Optional.ofNullable(
            expenseRepository.sumIncomeByUserAndDateRange(userId, startOfLastMonth, endOfLastMonth)
        ).orElse(BigDecimal.ZERO);

        BigDecimal netSavings = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? netSavings.multiply(BigDecimal.valueOf(100)).divide(totalIncome, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Change percents vs last month
        BigDecimal expenseChange = calculateChange(totalExpenses, lastMonthExpenses);
        BigDecimal incomeChange = calculateChange(totalIncome, lastMonthIncome);

        // Category breakdown
        List<Object[]> categoryData = expenseRepository.getCategoryWiseExpenses(userId, startOfMonth, endOfMonth);
        List<DashboardResponse.CategoryBreakdown> breakdowns = buildCategoryBreakdown(categoryData, totalExpenses);

        // Monthly trend (last 6 months)
        List<DashboardResponse.MonthlyTrendPoint> monthlyTrend = buildMonthlyTrend(userId, now);

        // Recent expenses (last 10)
        List<ExpenseResponse> recentExpenses = expenseRepository
                .findByUserIdOrderByDateDescCreatedAtDesc(userId, PageRequest.of(0, 10))
                .stream().map(expenseService::mapToResponse).toList();

        // Budget alerts (near or over limit)
        List<BudgetResponse> budgetAlerts = budgetService.getActiveBudgets(userId).stream()
                .filter(b -> b.getPercentageUsed().compareTo(new BigDecimal("75")) >= 0)
                .toList();

        // Upcoming bills (next 7 days)
        List<SubscriptionResponse> upcomingBills = subscriptionService
                .getSubscriptionsForUser(userId).stream()
                .filter(s -> s.getDaysUntilBilling() != null && s.getDaysUntilBilling() <= 7 && s.getDaysUntilBilling() >= 0)
                .toList();

        // Goals
        List<DashboardResponse.GoalResponse> goals = goalRepository.findByUserIdAndIsCompletedFalse(userId).stream()
                .map(g -> DashboardResponse.GoalResponse.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .targetAmount(g.getTargetAmount())
                        .currentAmount(g.getCurrentAmount())
                        .progressPercentage(g.getProgressPercentage())
                        .icon(g.getIcon())
                        .color(g.getColor())
                        .build())
                .limit(3)
                .toList();

        // Financial Health Score
        User user = userRepository.findById(userId).orElseThrow();
        String financialSummary = buildFinancialSummary(user, totalExpenses, totalIncome, netSavings, savingsRate, budgetAlerts.size());
        var healthResult = geminiService.calculateHealthScore(financialSummary);

        return DashboardResponse.builder()
                .financialHealthScore(healthResult.score())
                .healthScoreLabel(healthResult.label())
                .healthScoreTip(healthResult.tip())
                .totalExpenses(totalExpenses)
                .totalIncome(totalIncome)
                .netSavings(netSavings)
                .savingsRate(savingsRate)
                .expenseChangePercent(expenseChange)
                .incomeChangePercent(incomeChange)
                .monthlyTrend(monthlyTrend)
                .categoryBreakdown(breakdowns)
                .recentExpenses(recentExpenses)
                .budgetAlerts(budgetAlerts)
                .upcomingBills(upcomingBills)
                .goals(goals)
                .build();
    }

    private List<DashboardResponse.MonthlyTrendPoint> buildMonthlyTrend(Long userId, LocalDate now) {
        List<DashboardResponse.MonthlyTrendPoint> trend = new ArrayList<>();
        int year = now.getYear();

        List<Object[]> monthlyExpenses = expenseRepository.getMonthlyExpensesByYear(userId, year);
        List<Object[]> monthlyIncome = expenseRepository.getMonthlyIncomeByYear(userId, year);

        Map<Integer, BigDecimal> expMap = toMonthMap(monthlyExpenses);
        Map<Integer, BigDecimal> incMap = toMonthMap(monthlyIncome);

        // Show last 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            int m = month.getMonthValue();
            trend.add(DashboardResponse.MonthlyTrendPoint.builder()
                    .month(Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .expenses(expMap.getOrDefault(m, BigDecimal.ZERO))
                    .income(incMap.getOrDefault(m, BigDecimal.ZERO))
                    .build());
        }
        return trend;
    }

    private Map<Integer, BigDecimal> toMonthMap(List<Object[]> data) {
        Map<Integer, BigDecimal> map = new HashMap<>();
        for (Object[] row : data) {
            map.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }
        return map;
    }

    private List<DashboardResponse.CategoryBreakdown> buildCategoryBreakdown(
            List<Object[]> data, BigDecimal total) {

        List<DashboardResponse.CategoryBreakdown> list = new ArrayList<>();
        Map<String, String[]> iconColorMap = getCategoryMeta();

        for (Object[] row : data) {
            String catName = row[0] != null ? row[0].toString() : "Others";
            BigDecimal amount = (BigDecimal) row[1];
            BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? amount.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String[] meta = iconColorMap.getOrDefault(catName, new String[]{"📦", "#ABB2B9"});
            list.add(DashboardResponse.CategoryBreakdown.builder()
                    .category(catName)
                    .icon(meta[0])
                    .color(meta[1])
                    .amount(amount)
                    .percentage(pct)
                    .build());
        }
        return list;
    }

    private BigDecimal calculateChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }

    private String buildFinancialSummary(User user, BigDecimal expenses, BigDecimal income,
                                          BigDecimal savings, BigDecimal savingsRate, int budgetAlertsCount) {
        return String.format("""
            Monthly Income: ₹%s
            Monthly Expenses: ₹%s
            Net Savings: ₹%s
            Savings Rate: %s%%
            Budget Alerts: %d budgets near/over limit
            Currency: %s
            """, income, expenses, savings, savingsRate, budgetAlertsCount, user.getCurrency());
    }

    private Map<String, String[]> getCategoryMeta() {
        return Map.of(
            "Food & Dining", new String[]{"🍽️", "#FF6B6B"},
            "Transportation", new String[]{"🚗", "#4ECDC4"},
            "Shopping", new String[]{"🛍️", "#45B7D1"},
            "Entertainment", new String[]{"🎬", "#96CEB4"},
            "Healthcare", new String[]{"🏥", "#FFEAA7"},
            "Utilities", new String[]{"💡", "#DDA0DD"},
            "Rent & Housing", new String[]{"🏠", "#98D8C8"},
            "Travel", new String[]{"✈️", "#85C1E9"}
        );
    }
}
