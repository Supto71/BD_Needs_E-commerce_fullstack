-- =============================================================================
-- BDNeeds MySQL schema (generated from prisma/schema.prisma by scripts/gen-schema-sql.mjs)
-- Idempotent: safe to import many times. Import with --default-character-set=utf8mb4
-- =============================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('CUSTOMER', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'CUSTOMER',
    `phone` VARCHAR(191) NOT NULL DEFAULT '',
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isFraud` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `productCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Subcategory` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Subcategory_slug_key`(`slug`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `categoryName` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `subcategoryName` VARCHAR(191) NULL,
    `basePrice` DOUBLE NOT NULL,
    `originalPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `sku` VARCHAR(191) NOT NULL,
    `shortDescription` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `features` JSON NOT NULL,
    `specifications` JSON NOT NULL,
    `images` JSON NOT NULL,
    `tags` JSON NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `salesCount` INTEGER NOT NULL DEFAULT 0,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isBestSeller` BOOLEAN NOT NULL DEFAULT false,
    `isNew` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `imageAlt` VARCHAR(191) NULL,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `colorName` VARCHAR(191) NOT NULL,
    `colorHex` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `storage` VARCHAR(191) NULL,
    `ram` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,
    `images` JSON NOT NULL,

    UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `badge` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `image` VARCHAR(191) NOT NULL,
    `ctaText` VARCHAR(191) NOT NULL,
    `ctaLink` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `type` ENUM('HERO', 'CAMPAIGN', 'ANNOUNCEMENT') NOT NULL DEFAULT 'HERO',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Coupon` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `minOrderValue` DOUBLE NOT NULL DEFAULT 0,
    `maxDiscount` DOUBLE NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NOT NULL DEFAULT 100,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `shippingAddress` JSON NOT NULL,
    `deliveryNote` VARCHAR(191) NULL,
    `subtotal` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `couponCode` VARCHAR(191) NULL,
    `shippingFee` DOUBLE NOT NULL DEFAULT 0,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `paymentMethod` ENUM('COD', 'CARD', 'BKASH', 'NAGAD', 'ONLINE') NOT NULL DEFAULT 'COD',
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `orderStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `trackingNumber` VARCHAR(191) NOT NULL,
    `timeline` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uddoktaInvoiceId` VARCHAR(191) NULL,
    `uddoktaTransactionId` VARCHAR(191) NULL,
    `paymentDetails` JSON NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `Order_uddoktaInvoiceId_key`(`uddoktaInvoiceId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productSlug` VARCHAR(191) NOT NULL,
    `productImage` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `variantSku` VARCHAR(191) NULL,
    `variantColor` VARCHAR(191) NULL,
    `variantSize` VARCHAR(191) NULL,
    `variantStorage` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Review` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerAvatar` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `comment` TEXT NOT NULL,
    `images` JSON NOT NULL,
    `isVerifiedPurchase` BOOLEAN NOT NULL DEFAULT false,
    `isApproved` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'BdNeeds',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'BDT',
    `freeShippingThreshold` DOUBLE NOT NULL DEFAULT 5000,
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `contactEmail` VARCHAR(191) NOT NULL DEFAULT 'contact@bdneeds.com.bd',
    `contactPhone` VARCHAR(191) NOT NULL DEFAULT '01811277828',
    `shippingFeeInsideDhaka` DOUBLE NOT NULL DEFAULT 70,
    `shippingFeeOutsideDhaka` DOUBLE NOT NULL DEFAULT 130,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `RecycleBin` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `entityTitle` VARCHAR(191) NOT NULL,
    `originalData` JSON NOT NULL,
    `deletedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_userId_key`(`userId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CartItem_cartId_productId_variantId_key`(`cartId`, `productId`, `variantId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PasswordResetOTP` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PasswordResetOTP_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
