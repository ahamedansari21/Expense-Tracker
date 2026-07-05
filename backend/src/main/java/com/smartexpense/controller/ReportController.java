package com.smartexpense.controller;

import com.smartexpense.dto.response.ApiResponse;
import com.smartexpense.entity.Expense;
import com.smartexpense.entity.User;
import com.smartexpense.repository.ExpenseRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ExpenseRepository expenseRepository;

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().withDayOfMonth(1)}") String from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now()}") String to) {

        LocalDate start = LocalDate.parse(from);
        LocalDate end = LocalDate.parse(to);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), start, end);

        try (StringWriter sw = new StringWriter();
             CSVWriter csv = new CSVWriter(sw)) {

            csv.writeNext(new String[]{"Date", "Title", "Category", "Amount", "Type", "Payment Method", "Merchant", "Notes"});
            for (Expense e : expenses) {
                csv.writeNext(new String[]{
                        e.getDate().toString(),
                        e.getTitle(),
                        e.getCategory() != null ? e.getCategory().getName() : "",
                        e.getAmount().toPlainString(),
                        e.getType().name(),
                        e.getPaymentMethod() != null ? e.getPaymentMethod().name() : "",
                        e.getMerchant() != null ? e.getMerchant() : "",
                        e.getNotes() != null ? e.getNotes() : ""
                });
            }

            byte[] bytes = sw.toString().getBytes();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(bytes);
        } catch (Exception e) {
            log.error("CSV export error: {}", e.getMessage());
            throw new RuntimeException("Export failed");
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @AuthenticationPrincipal User user,
            @RequestParam String from,
            @RequestParam String to) {

        LocalDate start = LocalDate.parse(from);
        LocalDate end = LocalDate.parse(to);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), start, end);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Expenses");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont font = workbook.createFont();
            font.setColor(IndexedColors.WHITE.getIndex());
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"Date","Title","Category","Amount","Type","Payment","Merchant","Notes"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            CellStyle altStyle = workbook.createCellStyle();
            altStyle.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (Expense e : expenses) {
                Row row = sheet.createRow(rowNum++);
                if (rowNum % 2 == 0) {
                    for (int i = 0; i < 8; i++) {
                        row.createCell(i).setCellStyle(altStyle);
                    }
                }
                row.createCell(0).setCellValue(e.getDate().toString());
                row.createCell(1).setCellValue(e.getTitle());
                row.createCell(2).setCellValue(e.getCategory() != null ? e.getCategory().getName() : "");
                row.createCell(3).setCellValue(e.getAmount().doubleValue());
                row.createCell(4).setCellValue(e.getType().name());
                row.createCell(5).setCellValue(e.getPaymentMethod() != null ? e.getPaymentMethod().name() : "");
                row.createCell(6).setCellValue(e.getMerchant() != null ? e.getMerchant() : "");
                row.createCell(7).setCellValue(e.getNotes() != null ? e.getNotes() : "");
            }

            for (int i = 0; i < 8; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bos.toByteArray());
        } catch (Exception e) {
            log.error("Excel export error: {}", e.getMessage());
            throw new RuntimeException("Export failed");
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Object>> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam String from,
            @RequestParam String to) {

        LocalDate start = LocalDate.parse(from);
        LocalDate end = LocalDate.parse(to);
        List<Object[]> byCategory = expenseRepository.getCategoryWiseExpenses(user.getId(), start, end);
        var totalExp = expenseRepository.sumExpensesByUserAndDateRange(user.getId(), start, end);
        var totalInc = expenseRepository.sumIncomeByUserAndDateRange(user.getId(), start, end);

        var summary = java.util.Map.of(
                "totalExpenses", totalExp,
                "totalIncome", totalInc,
                "categoryBreakdown", byCategory.stream()
                        .map(r -> java.util.Map.of("category", r[0], "amount", r[1]))
                        .toList()
        );
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
