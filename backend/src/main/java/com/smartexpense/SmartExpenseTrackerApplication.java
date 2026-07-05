package com.smartexpense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Smart Expense Tracker - Main Application Entry Point
 * AI-powered personal finance management system
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class SmartExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartExpenseTrackerApplication.class, args);
        System.out.println("""
                
                ╔══════════════════════════════════════════════════╗
                ║     💰 Smart Expense Tracker AI Agent            ║
                ║     Server started successfully!                  ║
                ║     API: http://localhost:8080/api               ║
                ╚══════════════════════════════════════════════════╝
                """);
    }
}
