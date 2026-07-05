package com.smartexpense.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expense_groups")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "group_type")
    private GroupType groupType = GroupType.OTHER;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GroupMember> members = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum GroupType { TRIP, HOME, COUPLE, FRIENDS, WORK, OTHER }
}
