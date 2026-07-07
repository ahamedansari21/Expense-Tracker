package com.smartexpense.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.pro-model}")
    private String proModel;

    @Value("${gemini.api.max-tokens}")
    private int maxTokens;

    @Value("${gemini.api.temperature}")
    private double temperature;

    // =========================================================
    // Core generation method
    // =========================================================

    public String generate(String prompt) {
        return generateWithModel(prompt, model);
    }

    public String generatePro(String prompt) {
        return generateWithModel(prompt, proModel);
    }

    private String generateWithModel(String prompt, String modelName) {
        try {

            // ✅ Correct Gemini request body
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "maxOutputTokens", maxTokens,
                            "temperature", temperature
                    )
            );

            // ✅ FIXED WebClient usage (NO manual full URL)
            String responseJson = geminiWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .queryParam("key", apiKey)
                            .build(modelName)
                    )
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .onErrorResume(e -> {
    e.printStackTrace();
    log.error("Gemini API error", e);
    return Mono.just("{\"candidates\":[]}");
})
                    .block();

            return extractTextFromResponse(responseJson);

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return "I'm unable to process that request right now. Please try again.";
        }
    }

    private String extractTextFromResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText("Unable to generate response");
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            return "Unable to parse AI response";
        }
    }

    // =========================================================
    // Expense Categorization
    // =========================================================

    public CategorySuggestion categorizeExpense(String title, String merchant, double amount) {
        String prompt = String.format("""
                Categorize this expense and return ONLY JSON:

                Expense: "%s"
                Merchant: "%s"
                Amount: ₹%.2f

                Categories: Food & Dining, Transportation, Shopping, Entertainment,
                Healthcare, Utilities, Rent & Housing, Education, Travel, Others

                Return:
                {
                  "category": "...",
                  "confidence": 0.0,
                  "reasoning": "..."
                }
                """, title, merchant, amount);

        try {
            String response = generate(prompt);
            response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            JsonNode node = objectMapper.readTree(response);

            return new CategorySuggestion(
                    node.path("category").asText("Others"),
                    node.path("confidence").asDouble(0.7),
                    node.path("reasoning").asText("")
            );

        } catch (Exception e) {
            return new CategorySuggestion("Others", 0.5, "Default categorization");
        }
    }

    // =========================================================
    // Voice Parsing
    // =========================================================

    public VoiceExpenseParsed parseVoiceExpense(String text) {

        String prompt = String.format("""
                Convert this into structured JSON expense:

                "%s"

                Return JSON only:
                {
                  "title": "...",
                  "amount": 0,
                  "merchant": "...",
                  "category": "...",
                  "paymentMethod": "UPI",
                  "date": "today",
                  "notes": ""
                }
                """, text);

        try {
            String response = generate(prompt);
            response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            JsonNode node = objectMapper.readTree(response);

            return new VoiceExpenseParsed(
                    node.path("title").asText(text),
                    node.path("amount").asDouble(0),
                    node.path("merchant").asText(""),
                    node.path("category").asText("Others"),
                    node.path("paymentMethod").asText("UPI"),
                    node.path("date").asText("today"),
                    node.path("notes").asText("")
            );

        } catch (Exception e) {
            return new VoiceExpenseParsed(text, 0, "", "Others", "UPI", "today", "");
        }
    }

    // =========================================================
    // Chat Assistant
    // =========================================================

    public String chat(String userMessage, String conversationHistory, String userFinancialContext) {

        String prompt = String.format("""
                You are a financial assistant.

                Context:
                %s

                History:
                %s

                User: %s

                Reply clearly and helpfully.
                """, userFinancialContext, conversationHistory, userMessage);

        return generatePro(prompt);
    }

    // =========================================================
    // Monthly Insights
    // =========================================================

    public String generateMonthlyInsights(String financialContext) {
        String prompt = String.format("""
                You are a personal finance advisor. Analyze the following financial data and provide
                clear, actionable monthly insights in 3-5 bullet points. Be concise and helpful.

                Financial Context:
                %s

                Provide insights on:
                - Spending patterns and areas to watch
                - Savings performance
                - Top recommendations to improve finances
                """, financialContext);

        return generate(prompt);
    }

    // =========================================================
    // Spending Forecast
    // =========================================================

    public String generateForecast(String financialContext) {
        String prompt = String.format("""
                You are a personal finance advisor. Based on the following financial data,
                provide a short spending forecast for the rest of the month in 3-4 bullet points.
                Be data-driven and concise.

                Financial Context:
                %s

                Provide:
                - Projected total spending by month end
                - Categories likely to overspend
                - One key saving tip
                """, financialContext);

        return generate(prompt);
    }

    // =========================================================
    // Receipt OCR Data Extraction
    // =========================================================

    public ReceiptData extractReceiptData(String ocrText) {
        String prompt = String.format("""
                Extract expense details from this receipt text and return ONLY JSON:

                Receipt Text:
                "%s"

                Return:
                {
                  "merchant": "...",
                  "total": 0.0,
                  "category": "...",
                  "paymentMethod": "Cash",
                  "date": "..."
                }

                Categories: Food & Dining, Transportation, Shopping, Entertainment,
                Healthcare, Utilities, Rent & Housing, Education, Travel, Others
                Payment methods: Cash, UPI, Credit Card, Debit Card, Net Banking
                If a field cannot be determined, use empty string or 0.0 for total.
                """, ocrText);

        try {
            String response = generate(prompt);
            response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            JsonNode node = objectMapper.readTree(response);

            return new ReceiptData(
                    node.path("merchant").asText(""),
                    node.path("total").asDouble(0.0),
                    node.path("category").asText("Others"),
                    node.path("paymentMethod").asText("Cash"),
                    node.path("date").asText("")
            );

        } catch (Exception e) {
            log.error("Error extracting receipt data: {}", e.getMessage());
            return new ReceiptData("", 0.0, "Others", "Cash", "");
        }
    }

    // =========================================================
    // Financial Health Score
    // =========================================================

    public HealthScore calculateHealthScore(String financialSummary) {
        String prompt = String.format("""
                You are a financial advisor. Based on the following financial summary,
                calculate a health score and return ONLY JSON:

                %s

                Return:
                {
                  "score": 75,
                  "label": "Good",
                  "tip": "One actionable tip to improve finances"
                }

                Score ranges:
                - 0-40: Poor
                - 41-60: Fair
                - 61-80: Good
                - 81-100: Excellent

                Return only valid JSON, no extra text.
                """, financialSummary);

        try {
            String response = generate(prompt);
            response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            JsonNode node = objectMapper.readTree(response);

            int score = node.path("score").asInt(65);
            String label = node.path("label").asText("Good");
            String tip = node.path("tip").asText("Track your expenses regularly to stay on budget.");

            return new HealthScore(score, label, tip);

        } catch (Exception e) {
            log.error("Error calculating health score: {}", e.getMessage());
            return new HealthScore(65, "Good", "Track your expenses regularly to stay on budget.");
        }
    }

    // =========================================================
    // Records
    // =========================================================

    public record CategorySuggestion(String category, double confidence, String reasoning) {}
    public record VoiceExpenseParsed(String title, double amount, String merchant,
                                     String category, String paymentMethod, String date, String notes) {}
    public record ReceiptData(String merchant, double total, String category, String paymentMethod, String date) {}
    public record HealthScore(int score, String label, String tip) {}
}