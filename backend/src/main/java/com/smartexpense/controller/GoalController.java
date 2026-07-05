package com.smartexpense.controller;

import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.entity.FinancialGoal;
import com.smartexpense.entity.User;
import com.smartexpense.exception.ResourceNotFoundException;
import com.smartexpense.repository.FinancialGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/financial-goals")
@RequiredArgsConstructor
public class GoalController {

    private final FinancialGoalRepository goalRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FinancialGoal>>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FinancialGoal>> create(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        FinancialGoal goal = FinancialGoal.builder()
                .user(user)
                .name(body.get("name").toString())
                .targetAmount(new BigDecimal(body.get("targetAmount").toString()))
                .currentAmount(body.containsKey("currentAmount")
                        ? new BigDecimal(body.get("currentAmount").toString()) : BigDecimal.ZERO)
                .targetDate(body.containsKey("targetDate") && body.get("targetDate") != null
                        && !body.get("targetDate").toString().isBlank()
                        ? LocalDate.parse(body.get("targetDate").toString()) : null)
                .category(body.getOrDefault("category", "").toString())
                .icon(body.getOrDefault("icon", "🎯").toString())
                .color(body.getOrDefault("color", "#6171f6").toString())
                .build();
        return ResponseEntity.status(201).body(ApiResponse.success(goalRepository.save(goal)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialGoal>> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        FinancialGoal goal = goalRepository.findById(id)
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goal.setName(body.get("name").toString());
        goal.setTargetAmount(new BigDecimal(body.get("targetAmount").toString()));
        goal.setCurrentAmount(new BigDecimal(body.getOrDefault("currentAmount","0").toString()));
        if (body.containsKey("targetDate") && body.get("targetDate") != null
                && !body.get("targetDate").toString().isBlank()) {
            goal.setTargetDate(LocalDate.parse(body.get("targetDate").toString()));
        }
        goal.setCategory(body.getOrDefault("category","").toString());
        goal.setIcon(body.getOrDefault("icon","🎯").toString());
        goal.setColor(body.getOrDefault("color","#6171f6").toString());
        return ResponseEntity.ok(ApiResponse.success(goalRepository.save(goal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        FinancialGoal goal = goalRepository.findById(id)
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted", null));
    }
}
