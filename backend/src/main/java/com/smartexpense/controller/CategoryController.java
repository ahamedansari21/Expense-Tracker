package com.smartexpense.controller;

import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.dto.response.CategoryResponse;
import com.smartexpense.entity.Category;
import com.smartexpense.entity.User;
import com.smartexpense.repository.CategoryRepository;
import com.smartexpense.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @AuthenticationPrincipal User user) {
        List<CategoryResponse> categories = categoryRepository.findAllForUser(user.getId())
                .stream().map(expenseService::mapCategoryToResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {

        Category category = Category.builder()
                .name(body.get("name"))
                .icon(body.get("icon"))
                .color(body.get("color"))
                .type(Category.CategoryType.valueOf(
                        body.getOrDefault("type", "EXPENSE")))
                .user(user)
                .isDefault(false)
                .build();

        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(201).body(ApiResponse.success(expenseService.mapCategoryToResponse(saved)));
    }
}
