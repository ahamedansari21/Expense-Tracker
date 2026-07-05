package com.smartexpense.controller;

import com.smartexpense.ai.GeminiService;
import com.smartexpense.dto.request.ExpenseRequest;
import com.smartexpense.dto.response.*;
import com.smartexpense.entity.User;
import com.smartexpense.service.CloudStorageService;
import com.smartexpense.service.ExpenseService;
import com.smartexpense.service.OcrService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final OcrService ocrService;
    private final CloudStorageService cloudStorageService;
    private final GeminiService geminiService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExpenseResponse>>> getExpenses(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(
                expenseService.getExpenses(user.getId(), page, size, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getExpenseById(user.getId(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse expense = expenseService.createExpense(user.getId(), request);
        return ResponseEntity.status(201).body(ApiResponse.success("Expense added", expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.updateExpense(user.getId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        expenseService.deleteExpense(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted", null));
    }

    /** Voice/NLP expense parsing — returns structured data preview (not yet saved) */
    @PostMapping("/voice-parse")
    public ResponseEntity<ApiResponse<ExpenseResponse>> voiceParse(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        String text = body.get("text");
        return ResponseEntity.ok(ApiResponse.success(expenseService.parseVoiceExpense(user.getId(), text)));
    }

    /** Upload receipt → OCR → AI extraction → return pre-filled expense data */
    @PostMapping("/scan-receipt")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanReceipt(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {

        // 1. Upload to Cloudinary
        CloudStorageService.UploadResult upload = cloudStorageService.uploadReceipt(file, user.getId());
        // 2. OCR + AI extraction
        GeminiService.ReceiptData receipt = ocrService.extractFromReceipt(file);

        Map<String, Object> result = Map.of(
                "receiptUrl", upload.url(),
                "receiptPublicId", upload.publicId(),
                "merchant", receipt.merchant(),
                "amount", receipt.total(),
                "category", receipt.category(),
                "paymentMethod", receipt.paymentMethod(),
                "date", receipt.date()
        );
        return ResponseEntity.ok(ApiResponse.success("Receipt scanned successfully", result));
    }
}
