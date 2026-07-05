package com.smartexpense.service;

import com.smartexpense.dto.request.BudgetRequest;
import com.smartexpense.dto.response.BudgetResponse;
import com.smartexpense.entity.Budget;
import com.smartexpense.entity.Category;
import com.smartexpense.entity.User;
import com.smartexpense.exception.ResourceNotFoundException;
import com.smartexpense.repository.BudgetRepository;
import com.smartexpense.repository.CategoryRepository;
import com.smartexpense.repository.ExpenseRepository;
import com.smartexpense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseService expenseService;

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .name(request.getName())
                .amount(request.getAmount())
                .period(request.getPeriod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .alertThreshold(request.getAlertThreshold())
                .color(request.getColor())
                .build();

        // Calculate current spending for this budget period
        BigDecimal currentSpend = calculateCurrentSpend(userId, category, request.getStartDate(), request.getEndDate());
        budget.setSpent(currentSpend);

        return mapToResponse(budgetRepository.save(budget));
    }

    public List<BudgetResponse> getActiveBudgets(Long userId) {
        return budgetRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        budget.setName(request.getName());
        budget.setAmount(request.getAmount());
        budget.setCategory(category);
        budget.setPeriod(request.getPeriod());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setAlertThreshold(request.getAlertThreshold());
        budget.setColor(request.getColor());

        return mapToResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BigDecimal calculateCurrentSpend(Long userId, Category category, LocalDate start, LocalDate end) {
        if (category != null) {
            return Optional.ofNullable(
                expenseRepository.sumExpensesByUserAndDateRange(userId, start, end)
            ).orElse(BigDecimal.ZERO);
        }
        return Optional.ofNullable(
            expenseRepository.sumExpensesByUserAndDateRange(userId, start, end)
        ).orElse(BigDecimal.ZERO);
    }

    public BudgetResponse mapToResponse(Budget budget) {
        BigDecimal remaining = budget.getAmount().subtract(budget.getSpent());
        BigDecimal pct = budget.getPercentageUsed();
        boolean isOver = budget.getSpent().compareTo(budget.getAmount()) > 0;
        boolean isNear = !isOver && pct.compareTo(budget.getAlertThreshold()) >= 0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .name(budget.getName())
                .amount(budget.getAmount())
                .spent(budget.getSpent())
                .remaining(remaining.max(BigDecimal.ZERO))
                .percentageUsed(pct.min(new BigDecimal("100")))
                .period(budget.getPeriod().name())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .alertThreshold(budget.getAlertThreshold())
                .isActive(budget.getIsActive())
                .color(budget.getColor())
                .category(budget.getCategory() != null ? expenseService.mapCategoryToResponse(budget.getCategory()) : null)
                .isOverBudget(isOver)
                .isNearLimit(isNear)
                .build();
    }
}
