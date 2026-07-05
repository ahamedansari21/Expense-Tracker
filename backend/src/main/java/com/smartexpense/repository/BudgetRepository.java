package com.smartexpense.repository;

import com.smartexpense.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.isActive = true AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetsForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category.id = :categoryId AND b.isActive = true AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetByCategoryAndDate(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("date") LocalDate date);

    List<Budget> findByUserId(Long userId);
}
