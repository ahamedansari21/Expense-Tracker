package com.smartexpense.repository;

import com.smartexpense.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.isDefault = true OR c.user.id = :userId ORDER BY c.isDefault DESC, c.name ASC")
    List<Category> findAllForUser(@Param("userId") Long userId);

    List<Category> findByIsDefaultTrue();

    boolean existsByNameAndUserId(String name, Long userId);
}
