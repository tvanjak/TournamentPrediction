/*
  Warnings:

  - You are about to drop the column `provider` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provider_account_id` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_provider_account_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "provider",
DROP COLUMN "provider_account_id";
