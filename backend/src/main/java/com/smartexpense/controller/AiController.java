package com.smartexpense.controller;

import com.smartexpense.ai.GeminiService;
import com.smartexpense.dto.request.AiChatRequest;
import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.entity.AiChatHistory;
import com.smartexpense.entity.User;
import com.smartexpense.repository.AiChatHistoryRepository;
import com.smartexpense.repository.ExpenseRepository;
import com.smartexpense.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;
    private final AiChatHistoryRepository chatHistoryRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AiChatRequest request) {

        String sessionId = request.getSessionId() != null
                ? request.getSessionId()
                : UUID.randomUUID().toString();

        // Build conversation history (last 10 messages)
        List<AiChatHistory> history = chatHistoryRepository
                .findByUserIdAndSessionIdOrderByCreatedAtAscIdAsc(user.getId(), sessionId);
        String conversationHistory = history.stream()
                .map(h -> h.getRole().name() + ": " + h.getContent())
                .collect(Collectors.joining("\n"));

        // Build financial context
        String financialContext = buildFinancialContext(user);

        // Call Gemini
        String reply = geminiService.chat(request.getMessage(), conversationHistory, financialContext);

        // Persist both messages
        chatHistoryRepository.save(AiChatHistory.builder()
                .user(user).sessionId(sessionId)
                .role(AiChatHistory.ChatRole.USER)
                .content(request.getMessage()).build());

        chatHistoryRepository.save(AiChatHistory.builder()
                .user(user).sessionId(sessionId)
                .role(AiChatHistory.ChatRole.ASSISTANT)
                .content(reply).build());

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "reply", reply,
                "sessionId", sessionId)));
    }

    @GetMapping("/chat/sessions")
    public ResponseEntity<ApiResponse<List<String>>> getSessions(
            @AuthenticationPrincipal User user) {
        List<String> sessions = chatHistoryRepository
                .findSessionIdsByUserId(user.getId(), PageRequest.of(0, 20));
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/chat/history/{sessionId}")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getHistory(
            @AuthenticationPrincipal User user,
            @PathVariable String sessionId) {
        List<Map<String, String>> messages = chatHistoryRepository
                .findByUserIdAndSessionIdOrderByCreatedAtAsc(user.getId(), sessionId)
                .stream()
                .map(h -> Map.of(
                        "role", h.getRole().name().toLowerCase(),
                        "content", h.getContent(),
                        "time", h.getCreatedAt().toString()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @DeleteMapping("/chat/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @AuthenticationPrincipal User user,
            @PathVariable String sessionId) {
        chatHistoryRepository.deleteByUserIdAndSessionId(user.getId(), sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session deleted", null));
    }

    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<String>> getInsights(
            @AuthenticationPrincipal User user) {
        String financialContext = buildFinancialContext(user);
        String insights = geminiService.generateMonthlyInsights(financialContext);
        return ResponseEntity.ok(ApiResponse.success(insights));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<String>> getForecast(
            @AuthenticationPrincipal User user) {
        String financialContext = buildFinancialContext(user);
        String forecast = geminiService.generateForecast(financialContext);
        return ResponseEntity.ok(ApiResponse.success(forecast));
    }

    private String buildFinancialContext(User user) {
        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal expenses = Optional.ofNullable(
                expenseRepository.sumExpensesByUserAndDateRange(user.getId(), start, end))
                .orElse(BigDecimal.ZERO);

        BigDecimal income = Optional.ofNullable(
                expenseRepository.sumIncomeByUserAndDateRange(user.getId(), start, end))
                .orElse(BigDecimal.ZERO);

        List<Object[]> categories = expenseRepository.getCategoryWiseExpenses(user.getId(), start, end);
        String categoryBreakdown = categories.stream()
                .map(r -> r[0] + ": ₹" + r[1])
                .collect(Collectors.joining(", "));

        return String.format("""
                User: %s
                Monthly Income: ₹%s
                Monthly Expenses: ₹%s
                Net Savings: ₹%s
                Top Spending Categories: %s
                Currency: %s
                """,
                user.getFullName(), income, expenses,
                income.subtract(expenses), categoryBreakdown, user.getCurrency());
    }
}
