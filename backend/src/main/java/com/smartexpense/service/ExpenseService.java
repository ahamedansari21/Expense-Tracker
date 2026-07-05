package com.smartexpense.service;

import com.smartexpense.ai.GeminiService;
import com.smartexpense.dto.request.ExpenseRequest;
import com.smartexpense.dto.response.CategoryResponse;
import com.smartexpense.dto.response.ExpenseResponse;
import com.smartexpense.dto.response.PageResponse;
import com.smartexpense.entity.Budget;
import com.smartexpense.entity.Category;
import com.smartexpense.entity.Expense;
import com.smartexpense.entity.User;
import com.smartexpense.exception.BadRequestException;
import com.smartexpense.exception.ResourceNotFoundException;
import com.smartexpense.repository.BudgetRepository;
import com.smartexpense.repository.CategoryRepository;
import com.smartexpense.repository.ExpenseRepository;
import com.smartexpense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final GeminiService geminiService;
    private final NotificationService notificationService;

    @Transactional
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = getUserOrThrow(userId);

        // Resolve category
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        // AI auto-categorize if no category given
        if (category == null) {
            var suggestion = geminiService.categorizeExpense(
                request.getTitle(),
                request.getMerchant() != null ? request.getMerchant() : "",
                request.getAmount().doubleValue()
            );
            category = findCategoryByName(suggestion.category(), userId);
        }

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate())
                .time(request.getTime())
                .paymentMethod(request.getPaymentMethod())
                .merchant(request.getMerchant())
                .location(request.getLocation())
                .isRecurring(request.getIsRecurring())
                .recurringInterval(request.getRecurringInterval())
                .tags(request.getTags())
                .notes(request.getNotes())
                .build();

        expense = expenseRepository.save(expense);

        // Update budget spending asynchronously
        if (request.getType() == Expense.ExpenseType.EXPENSE) {
            updateBudgetSpending(userId, category, request.getAmount(), request.getDate());
        }

        return mapToResponse(expense);
    }

    public PageResponse<ExpenseResponse> getExpenses(Long userId, int page, int size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("date").descending().and(Sort.by("createdAt").descending()));

        Page<Expense> expenses;
        if (search != null && !search.isBlank()) {
            expenses = expenseRepository.searchExpenses(userId, search, pageRequest);
        } else {
            expenses = expenseRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId, pageRequest);
        }

        Page<ExpenseResponse> responsePage = expenses.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    public ExpenseResponse getExpenseById(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return mapToResponse(expense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setType(request.getType());
        expense.setDate(request.getDate());
        expense.setTime(request.getTime());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setMerchant(request.getMerchant());
        expense.setLocation(request.getLocation());
        expense.setCategory(category);
        expense.setIsRecurring(request.getIsRecurring());
        expense.setRecurringInterval(request.getRecurringInterval());
        expense.setTags(request.getTags());
        expense.setNotes(request.getNotes());

        return mapToResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    public ExpenseResponse parseVoiceExpense(Long userId, String text) {
        var parsed = geminiService.parseVoiceExpense(text);

        // Build a preview response (not saved yet)
        LocalDate date = "yesterday".equalsIgnoreCase(parsed.date())
                ? LocalDate.now().minusDays(1) : LocalDate.now();

        Category category = findCategoryByName(parsed.category(), userId);

        return ExpenseResponse.builder()
                .title(parsed.title())
                .amount(BigDecimal.valueOf(parsed.amount()))
                .type("EXPENSE")
                .date(date)
                .merchant(parsed.merchant())
                .paymentMethod(parsed.paymentMethod())
                .notes(parsed.notes())
                .category(category != null ? mapCategoryToResponse(category) : null)
                .build();
    }

    // ---- Budget update helper ----

    @Async
    public void updateBudgetSpending(Long userId, Category category, BigDecimal amount, LocalDate date) {
        try {
            List<Budget> activeBudgets = budgetRepository.findActiveBudgetsForDate(userId, date);
            for (Budget budget : activeBudgets) {
                boolean matches = budget.getCategory() == null ||
                        (category != null && budget.getCategory().getId().equals(category.getId()));
                if (matches) {
                    budget.setSpent(budget.getSpent().add(amount));
                    budgetRepository.save(budget);

                    // Alert if over threshold
                    BigDecimal pct = budget.getPercentageUsed();
                    if (pct.compareTo(budget.getAlertThreshold()) >= 0) {
                        notificationService.sendBudgetAlert(userId, budget);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error updating budget spending: {}", e.getMessage());
        }
    }

    // ---- Mapping helpers ----

    public ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .type(expense.getType().name())
                .date(expense.getDate())
                .time(expense.getTime())
                .paymentMethod(expense.getPaymentMethod() != null ? expense.getPaymentMethod().name() : null)
                .merchant(expense.getMerchant())
                .location(expense.getLocation())
                .receiptUrl(expense.getReceiptUrl())
                .isRecurring(expense.getIsRecurring())
                .recurringInterval(expense.getRecurringInterval() != null ? expense.getRecurringInterval().name() : null)
                .tags(expense.getTags())
                .notes(expense.getNotes())
                .isFraudulent(expense.getIsFraudulent())
                .fraudReason(expense.getFraudReason())
                .aiConfidence(expense.getAiConfidence())
                .category(expense.getCategory() != null ? mapCategoryToResponse(expense.getCategory()) : null)
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }

    public CategoryResponse mapCategoryToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .type(category.getType().name())
                .isDefault(category.getIsDefault())
                .build();
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Category findCategoryByName(String name, Long userId) {
        return categoryRepository.findAllForUser(userId).stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(null);
    }
}
