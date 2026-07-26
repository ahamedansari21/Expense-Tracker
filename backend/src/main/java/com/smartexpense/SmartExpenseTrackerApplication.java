package com.smartexpense;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.smartexpense.repository.UserRepository;
import com.smartexpense.repository.CategoryRepository;
import com.smartexpense.entity.User;
import com.smartexpense.entity.Category;
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
    public CommandLineRunner initDatabase(UserRepository userRepository, 
                                         CategoryRepository categoryRepository,
                                         org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Unlock existing locked users
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

            // 2. Seed Default Categories if database is empty
            try {
                if (categoryRepository.count() == 0) {
                    List<Category> defaultCategories = List.of(
                        Category.builder().name("Food & Dining").icon("🍽️").color("#FF6B6B").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Transportation").icon("🚗").color("#4ECDC4").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Shopping").icon("🛍️").color("#45B7D1").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Entertainment").icon("🎬").color("#96CEB4").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Healthcare").icon("🏥").color("#FFEAA7").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Utilities").icon("💡").color("#DDA0DD").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Rent & Housing").icon("🏠").color("#98D8C8").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Education").icon("📚").color("#F7DC6F").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Travel").icon("✈️").color("#85C1E9").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Personal Care").icon("💄").color("#F1948A").type(Category.CategoryType.EXPENSE).isDefault(true).build(),
                        Category.builder().name("Investments").icon("📈").color("#82E0AA").type(Category.CategoryType.INCOME).isDefault(true).build(),
                        Category.builder().name("Salary").icon("💼").color("#76D7C4").type(Category.CategoryType.INCOME).isDefault(true).build(),
                        Category.builder().name("Freelance").icon("💻").color("#F8C471").type(Category.CategoryType.INCOME).isDefault(true).build(),
                        Category.builder().name("Business").icon("🏢").color("#C39BD3").type(Category.CategoryType.INCOME).isDefault(true).build(),
                        Category.builder().name("Gifts").icon("🎁").color("#F0B27A").type(Category.CategoryType.BOTH).isDefault(true).build(),
                        Category.builder().name("Others").icon("📦").color("#ABB2B9").type(Category.CategoryType.BOTH).isDefault(true).build()
                    );
                    categoryRepository.saveAll(defaultCategories);
                    System.out.println("=== [MIGRATION] Seeded " + defaultCategories.size() + " default categories ===");
                }
            } catch (Exception e) {
                System.err.println("=== [MIGRATION ERROR] Failed to seed default categories: " + e.getMessage() + " ===");
            }

            // 3. Seed Demo User if doesn't exist
            try {
                String demoEmail = "demo@smartexpense.com";
                if (!userRepository.existsByEmail(demoEmail)) {
                    User demoUser = User.builder()
                        .fullName("Demo User")
                        .email(demoEmail)
                        .password(passwordEncoder.encode("Demo@1234"))
                        .monthlyIncome(new java.math.BigDecimal("75000.00"))
                        .currency("INR")
                        .emailVerified(true)
                        .isActive(true)
                        .role(User.Role.USER)
                        .provider(User.Provider.LOCAL)
                        .themePreference(User.ThemePreference.LIGHT)
                        .build();
                    userRepository.save(demoUser);
                    System.out.println("=== [MIGRATION] Seeded demo user: " + demoEmail + " ===");
                }
            } catch (Exception e) {
                System.err.println("=== [MIGRATION ERROR] Failed to seed demo user: " + e.getMessage() + " ===");
            }
        };
    }
}
