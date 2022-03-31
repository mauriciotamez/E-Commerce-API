/*
  Warnings:

  - You are about to drop the column `cartId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Products` table. All the data in the column will be lost.
  - Added the required column `CartId` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_userId_fkey";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "cartId",
DROP COLUMN "userId",
ADD COLUMN     "CartId" INTEGER NOT NULL,
ADD COLUMN     "UserId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "userId",
ADD COLUMN     "UserId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProductsInCart" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "CartId" INTEGER NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'active',

    CONSTRAINT "ProductsInCart_pkey" PRIMARY KEY ("ProductId","CartId")
);

-- CreateTable
CREATE TABLE "Carts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "UserId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'active',

    CONSTRAINT "Carts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsInCart" ADD CONSTRAINT "ProductsInCart_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsInCart" ADD CONSTRAINT "ProductsInCart_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES "Carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carts" ADD CONSTRAINT "Carts_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES "Carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
