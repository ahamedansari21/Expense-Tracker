package com.smartexpense.repository;

import com.smartexpense.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    Page<Expense> findByUserIdOrderByDateDescCreatedAtDesc(Long userId, Pageable pageable);

    List<Expense> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year ORDER BY e.date DESC")
    List<Expense> findByUserAndMonth(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.type = 'EXPENSE' AND e.date BETWEEN :start AND :end")
    BigDecimal sumExpensesByUserAndDateRange(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.type = 'INCOME' AND e.date BETWEEN :start AND :end")
    BigDecimal sumIncomeByUserAndDateRange(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e.category.name, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.type = 'EXPENSE' AND e.date BETWEEN :start AND :end GROUP BY e.category.name ORDER BY SUM(e.amount) DESC")
    List<Object[]> getCategoryWiseExpenses(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT MONTH(e.date), SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.type = 'EXPENSE' AND YEAR(e.date) = :year GROUP BY MONTH(e.date) ORDER BY MONTH(e.date)")
    List<Object[]> getMonthlyExpensesByYear(@Param("userId") Long userId, @Param("year") int year);

    @Query("SELECT MONTH(e.date), SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.type = 'INCOME' AND YEAR(e.date) = :year GROUP BY MONTH(e.date) ORDER BY MONTH(e.date)")
    List<Object[]> getMonthlyIncomeByYear(@Param("userId") Long userId, @Param("year") int year);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.type = 'EXPENSE' AND e.date BETWEEN :start AND :end ORDER BY e.amount DESC")
    List<Expense> findTopExpenses(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end, Pageable pageable);

    long countByUserId(Long userId);

    @Query("SELECT AVG(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.type = 'EXPENSE' AND e.date BETWEEN :start AND :end")
    BigDecimal avgExpenseByUserAndDateRange(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND (LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.merchant) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY e.date DESC")
    Page<Expense> searchExpenses(@Param("userId") Long userId, @Param("query") String query, Pageable pageable);

    List<Expense> findByUserIdAndCategoryIdAndDateBetween(Long userId, Long categoryId, LocalDate start, LocalDate end);
}
