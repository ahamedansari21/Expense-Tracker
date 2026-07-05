package com.smartexpense.repository;

import com.smartexpense.entity.AiChatHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatHistoryRepository extends JpaRepository<AiChatHistory, Long> {

    // ✅ Get chat messages in a session (oldest first)
    List<AiChatHistory> findByUserIdAndSessionIdOrderByCreatedAtAsc(
            Long userId,
            String sessionId
    );

    // ✅ FIXED: Get sessionIds ordered by latest message time
    @Query("""
        SELECT a.sessionId
        FROM AiChatHistory a
        WHERE a.user.id = :userId
        GROUP BY a.sessionId
        ORDER BY MAX(a.createdAt) DESC
    """)
    List<String> findSessionIdsByUserId(@Param("userId") Long userId, Pageable pageable);

    // ✅ Delete a full chat session
    @Modifying
    @Query("""
        DELETE FROM AiChatHistory a
        WHERE a.user.id = :userId
        AND a.sessionId = :sessionId
    """)
    void deleteByUserIdAndSessionId(
            @Param("userId") Long userId,
            @Param("sessionId") String sessionId
    );

    // ✅ Alternative method (safe ordering by id too)
    List<AiChatHistory> findByUserIdAndSessionIdOrderByCreatedAtAscIdAsc(
            Long userId,
            String sessionId
    );

    // ✅ Count total chats of user
    long countByUserId(Long userId);
}