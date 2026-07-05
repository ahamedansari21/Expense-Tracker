-- ============================================================
-- Smart Expense Tracker - Complete Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_expense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_expense;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    currency VARCHAR(10) DEFAULT 'INR',
    monthly_income DECIMAL(15,2) DEFAULT 0.00,
    provider ENUM('LOCAL', 'GOOGLE') DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    theme_preference ENUM('LIGHT', 'DARK', 'SYSTEM') DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_provider_id (provider_id)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    type ENUM('EXPENSE', 'INCOME', 'BOTH') DEFAULT 'EXPENSE',
    is_default BOOLEAN DEFAULT FALSE,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    type ENUM('EXPENSE', 'INCOME') DEFAULT 'EXPENSE',
    date DATE NOT NULL,
    time TIME,
    payment_method ENUM('CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'OTHER') DEFAULT 'UPI',
    merchant VARCHAR(255),
    location VARCHAR(255),
    receipt_url VARCHAR(500),
    receipt_public_id VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
    tags JSON,
    notes TEXT,
    ai_confidence DECIMAL(5,2),
    ai_category_suggestion VARCHAR(100),
    is_fraudulent BOOLEAN DEFAULT FALSE,
    fraud_reason VARCHAR(500),
    group_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, date),
    INDEX idx_category (category_id),
    INDEX idx_type (type),
    INDEX idx_date (date)
);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    spent DECIMAL(15,2) DEFAULT 0.00,
    period ENUM('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_threshold DECIMAL(5,2) DEFAULT 80.00,
    is_active BOOLEAN DEFAULT TRUE,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_period (user_id, period),
    INDEX idx_active (is_active)
);

-- ============================================================
-- SUBSCRIPTIONS / BILLS
-- ============================================================
CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    billing_cycle ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') DEFAULT 'MONTHLY',
    next_billing_date DATE NOT NULL,
    last_billed_date DATE,
    payment_method ENUM('CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'OTHER') DEFAULT 'CARD',
    status ENUM('ACTIVE', 'PAUSED', 'CANCELLED') DEFAULT 'ACTIVE',
    logo_url VARCHAR(500),
    color VARCHAR(20),
    remind_days_before INT DEFAULT 3,
    notes TEXT,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_billing_date (next_billing_date)
);

-- ============================================================
-- GROUPS (Expense Sharing)
-- ============================================================
CREATE TABLE expense_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    cover_image_url VARCHAR(500),
    currency VARCHAR(10) DEFAULT 'INR',
    group_type ENUM('TRIP', 'HOME', 'COUPLE', 'FRIENDS', 'WORK', 'OTHER') DEFAULT 'OTHER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (group_id, user_id)
);

CREATE TABLE group_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    expense_id BIGINT NOT NULL,
    paid_by BIGINT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    split_type ENUM('EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES') DEFAULT 'EQUAL',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE expense_splits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_expense_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,2),
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP,
    FOREIGN KEY (group_expense_id) REFERENCES group_expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- AI CHAT HISTORY
-- ============================================================
CREATE TABLE ai_chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(100),
    role ENUM('USER', 'ASSISTANT') NOT NULL,
    content TEXT NOT NULL,
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_session (user_id, session_id),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('BUDGET_ALERT', 'BILL_DUE', 'FRAUD_ALERT', 'INSIGHT', 'SYSTEM') DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read)
);

-- ============================================================
-- FINANCIAL GOALS
-- ============================================================
CREATE TABLE financial_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    target_date DATE,
    category VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(20),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255))
);

-- ============================================================
-- DEFAULT CATEGORY SEED
-- ============================================================
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Food & Dining', '🍽️', '#FF6B6B', 'EXPENSE', TRUE),
('Transportation', '🚗', '#4ECDC4', 'EXPENSE', TRUE),
('Shopping', '🛍️', '#45B7D1', 'EXPENSE', TRUE),
('Entertainment', '🎬', '#96CEB4', 'EXPENSE', TRUE),
('Healthcare', '🏥', '#FFEAA7', 'EXPENSE', TRUE),
('Utilities', '💡', '#DDA0DD', 'EXPENSE', TRUE),
('Rent & Housing', '🏠', '#98D8C8', 'EXPENSE', TRUE),
('Education', '📚', '#F7DC6F', 'EXPENSE', TRUE),
('Travel', '✈️', '#85C1E9', 'EXPENSE', TRUE),
('Personal Care', '💄', '#F1948A', 'EXPENSE', TRUE),
('Investments', '📈', '#82E0AA', 'INCOME', TRUE),
('Salary', '💼', '#76D7C4', 'INCOME', TRUE),
('Freelance', '💻', '#F8C471', 'INCOME', TRUE),
('Business', '🏢', '#C39BD3', 'INCOME', TRUE),
('Gifts', '🎁', '#F0B27A', 'BOTH', TRUE),
('Others', '📦', '#ABB2B9', 'BOTH', TRUE);
