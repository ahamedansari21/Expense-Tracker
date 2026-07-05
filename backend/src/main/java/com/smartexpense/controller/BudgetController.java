package com.smartexpense.controller;

import com.smartexpense.dto.request.BudgetRequest;
import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.dto.response.BudgetResponse;
import com.smartexpense.entity.User;
import com.smartexpense.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getActiveBudgets(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse budget = budgetService.createBudget(user.getId(), request);
        return ResponseEntity.status(201).body(ApiResponse.success("Budget created", budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.updateBudget(user.getId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        budgetService.deleteBudget(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted", null));
    }
}
