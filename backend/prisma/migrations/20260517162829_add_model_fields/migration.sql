-- AlterTable
ALTER TABLE `users` ADD COLUMN `bodyDescription` TEXT NULL,
    ADD COLUMN `clothesTaste` TEXT NULL,
    ADD COLUMN `isModel` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `photo` VARCHAR(191) NULL;
