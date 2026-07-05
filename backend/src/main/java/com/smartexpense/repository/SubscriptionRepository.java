package com.smartexpense.repository;

import com.smartexpense.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserIdOrderByNextBillingDateAsc(Long userId);

    List<Subscription> findByUserIdAndStatus(Long userId, Subscription.SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.nextBillingDate BETWEEN :start AND :end")
    List<Subscription> findDueSoonSubscriptions(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(s.amount) FROM Subscription s WHERE s.user.id = :userId AND s.status = 'ACTIVE' AND s.billingCycle = 'MONTHLY'")
    BigDecimal getTotalMonthlySubscriptionCost(@Param("userId") Long userId);

    @Query("SELECT SUM(s.amount) FROM Subscription s WHERE s.user.id = :userId AND s.status = 'ACTIVE'")
    BigDecimal getTotalSubscriptionCost(@Param("userId") Long userId);
}
