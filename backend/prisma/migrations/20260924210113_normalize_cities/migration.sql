/*
  Warnings:

  - You are about to drop the column `destination` on the `flights` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `flights` table. All the data in the column will be lost.
  - Added the required column `destination_id` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_id` to the `flights` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flights" DROP COLUMN "destination",
DROP COLUMN "origin",
ADD COLUMN     "destination_id" TEXT NOT NULL,
ADD COLUMN     "origin_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_code_key" ON "cities"("code");

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_origin_id_fkey" FOREIGN KEY ("origin_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
