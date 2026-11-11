-- =============================================================================
-- BDNeeds starter data. Imported ONLY on a fresh database by cpanel-setup.sh.
-- Safe to run twice (ON DUPLICATE KEY UPDATE keeps existing rows unchanged).
-- Product catalog: optional, run `node prisma/seed.js` from the app root.
-- =============================================================================
SET NAMES utf8mb4;

INSERT INTO `Settings` (`id`, `storeName`, `currency`, `freeShippingThreshold`, `taxRate`, `contactEmail`, `contactPhone`, `shippingFeeInsideDhaka`, `shippingFeeOutsideDhaka`)
VALUES (1, 'BdNeeds', 'BDT', 5000, 0, 'contact@bdneeds.com.bd', '01811277828', 70, 130)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Default admin: admin@bdneeds.com / admin123  (bcrypt hash). CHANGE THE PASSWORD AFTER FIRST LOGIN.
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`, `phone`, `createdAt`, `isFraud`)
VALUES ('usr-admin-1', 'bdneeds Executive Admin', 'admin@bdneeds.com', '$2b$10$4LPUShDlLUmgPUWDLsduxuW7RpOh1oJH79NPSzUZHjuO85vov8rMe', 'ADMIN', '01811277828', NOW(3), false)
ON DUPLICATE KEY UPDATE `email` = `email`;

