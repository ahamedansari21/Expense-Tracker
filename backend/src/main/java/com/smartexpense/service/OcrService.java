package com.smartexpense.service;

import com.smartexpense.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final GeminiService geminiService;

    /**
     * Extract text from a receipt image using Tesseract OCR,
     * then enhance / parse via Gemini AI.
     */
    public GeminiService.ReceiptData extractFromReceipt(MultipartFile file) {
        String ocrText = performOcr(file);
        log.debug("OCR raw text: {}", ocrText);
        return geminiService.extractReceiptData(ocrText);
    }

    private String performOcr(MultipartFile file) {
        try {
            Tesseract tesseract = new Tesseract();
            // Try system tessdata path; falls back gracefully
            tesseract.setDatapath(System.getenv().getOrDefault("TESSDATA_PREFIX", "/usr/share/tesseract-ocr/4.00/tessdata"));
            tesseract.setLanguage("eng");
            tesseract.setPageSegMode(6);

            BufferedImage img = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
            if (img == null) {
                return "Unable to read image";
            }
            return tesseract.doOCR(img);
        } catch (TesseractException | IOException e) {
            log.warn("OCR failed (will use AI fallback): {}", e.getMessage());
            // Return raw filename as minimal context for AI
            return "Receipt from " + file.getOriginalFilename();
        }
    }
}
