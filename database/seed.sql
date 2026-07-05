-- ============================================================
-- Smart Expense Tracker - Sample Seed Data
-- ============================================================
USE smart_expense;

-- Demo user (password: Demo@1234)
INSERT INTO users (email, password, full_name, monthly_income, currency, email_verified) VALUES
('demo@smartexpense.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniMWVaSxQoUDpAJd2OM.T8aWK', 'Demo User', 75000.00, 'INR', TRUE);

SET @user_id = LAST_INSERT_ID();

-- Sample expenses for current month
INSERT INTO expenses (user_id, category_id, title, amount, type, date, payment_method, merchant) VALUES
(@user_id, 1, 'Swiggy Order - Lunch', 450.00, 'EXPENSE', CURDATE() - INTERVAL 1 DAY, 'UPI', 'Swiggy'),
(@user_id, 1, 'Zomato Dinner', 680.00, 'EXPENSE', CURDATE() - INTERVAL 2 DAY, 'UPI', 'Zomato'),
(@user_id, 2, 'Uber Ride', 250.00, 'EXPENSE', CURDATE() - INTERVAL 3 DAY, 'UPI', 'Uber'),
(@user_id, 3, 'Amazon Shopping', 1200.00, 'EXPENSE', CURDATE() - INTERVAL 4 DAY, 'CARD', 'Amazon'),
(@user_id, 6, 'Electricity Bill', 1800.00, 'EXPENSE', CURDATE() - INTERVAL 5 DAY, 'NET_BANKING', 'MSEB'),
(@user_id, 4, 'Netflix Subscription', 649.00, 'EXPENSE', CURDATE() - INTERVAL 6 DAY, 'CARD', 'Netflix'),
(@user_id, 12, 'Monthly Salary', 75000.00, 'INCOME', CURDATE() - INTERVAL 7 DAY, 'NET_BANKING', 'Employer');

-- Sample budgets
INSERT INTO budgets (user_id, category_id, name, amount, period, start_date, end_date, color) VALUES
(@user_id, 1, 'Food & Dining Budget', 8000.00, 'MONTHLY', DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE()), '#FF6B6B'),
(@user_id, 2, 'Transportation Budget', 3000.00, 'MONTHLY', DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE()), '#4ECDC4'),
(@user_id, 3, 'Shopping Budget', 5000.00, 'MONTHLY', DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE()), '#45B7D1');

-- Sample subscriptions
INSERT INTO subscriptions (user_id, category_id, name, provider, amount, billing_cycle, next_billing_date, status, color) VALUES
(@user_id, 4, 'Netflix', 'Netflix Inc.', 649.00, 'MONTHLY', CURDATE() + INTERVAL 25 DAY, 'ACTIVE', '#E50914'),
(@user_id, 4, 'Spotify', 'Spotify AB', 119.00, 'MONTHLY', CURDATE() + INTERVAL 10 DAY, 'ACTIVE', '#1DB954'),
(@user_id, 4, 'Amazon Prime', 'Amazon', 1499.00, 'YEARLY', CURDATE() + INTERVAL 200 DAY, 'ACTIVE', '#FF9900'),
(@user_id, 6, 'Internet Plan', 'JioFiber', 1299.00, 'MONTHLY', CURDATE() + INTERVAL 15 DAY, 'ACTIVE', '#0070CC');

-- Sample financial goal
INSERT INTO financial_goals (user_id, name, target_amount, current_amount, target_date, category, icon, color) VALUES
(@user_id, 'Emergency Fund', 150000.00, 45000.00, CURDATE() + INTERVAL 12 MONTH, 'Savings', '🏦', '#4ECDC4'),
(@user_id, 'New Laptop', 80000.00, 20000.00, CURDATE() + INTERVAL 6 MONTH, 'Technology', '💻', '#45B7D1'),
(@user_id, 'Goa Trip', 30000.00, 12000.00, CURDATE() + INTERVAL 3 MONTH, 'Travel', '✈️', '#96CEB4');
