package com.smartexpense.service;

import com.smartexpense.dto.response.CategoryResponse;
import com.smartexpense.entity.Category;
import com.smartexpense.entity.User;
import com.smartexpense.exception.BadRequestException;
import com.smartexpense.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;

    public List<CategoryResponse> listForUser(Long userId) {
        return categoryRepository.findAllForUser(userId)
                .stream().map(expenseService::mapCategoryToResponse).toList();
    }

    @Transactional
    public CategoryResponse createCategory(User user, String name, String icon,
                                            String color, String type) {
        if (categoryRepository.existsByNameAndUserId(name, user.getId())) {
            throw new BadRequestException("Category '" + name + "' already exists");
        }
        Category category = Category.builder()
                .name(name).icon(icon).color(color)
                .type(Category.CategoryType.valueOf(type))
                .user(user).isDefault(false)
                .build();
        return expenseService.mapCategoryToResponse(categoryRepository.save(category));
    }
}
