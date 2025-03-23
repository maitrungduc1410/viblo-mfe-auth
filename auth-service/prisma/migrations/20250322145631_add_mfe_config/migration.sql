-- CreateTable
CREATE TABLE `MFEConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `remoteEntry` VARCHAR(191) NOT NULL,
    `remoteName` VARCHAR(191) NOT NULL,
    `exposedModule` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MFEConfig_remoteEntry_key`(`remoteEntry`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MFEConfigScopes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MFEConfigScopes_AB_unique`(`A`, `B`),
    INDEX `_MFEConfigScopes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_MFEConfigScopes` ADD CONSTRAINT `_MFEConfigScopes_A_fkey` FOREIGN KEY (`A`) REFERENCES `MFEConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MFEConfigScopes` ADD CONSTRAINT `_MFEConfigScopes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Scope`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
