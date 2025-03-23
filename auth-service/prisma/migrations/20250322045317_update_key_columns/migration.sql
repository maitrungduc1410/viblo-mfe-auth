-- DropIndex
DROP INDEX `User_privateKey_key` ON `User`;

-- DropIndex
DROP INDEX `User_publicKey_key` ON `User`;

-- AlterTable
ALTER TABLE `User` MODIFY `publicKey` TEXT NOT NULL,
    MODIFY `privateKey` TEXT NOT NULL;
