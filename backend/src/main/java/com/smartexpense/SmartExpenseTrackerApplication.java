package com.smartexpense;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.smartexpense.repository.UserRepository;
import com.smartexpense.entity.User;
import java.util.List;

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

    @Bean
    public CommandLineRunner unlockExistingUsers(UserRepository userRepository) {
        return args -> {
            try {
                List<User> lockedUsers = userRepository.findAll().stream()
                        .filter(user -> user.getIsActive() == null || !user.getIsActive())
                        .toList();
                if (!lockedUsers.isEmpty()) {
                    lockedUsers.forEach(user -> user.setIsActive(true));
                    userRepository.saveAll(lockedUsers);
                    System.out.println("=== [MIGRATION] Successfully unlocked " + lockedUsers.size() + " existing locked accounts ===");
                }
            } catch (Exception e) {
                System.err.println("=== [MIGRATION ERROR] Failed to unlock existing users: " + e.getMessage() + " ===");
            }
        };
    }
}
