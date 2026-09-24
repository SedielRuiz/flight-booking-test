-- CreateEnum
CREATE TYPE "FlightStatus" AS ENUM ('SCHEDULED', 'DELAYED', 'CANCELLED', 'SOLD_OUT');

-- AlterTable
ALTER TABLE "flights" ADD COLUMN     "status" "FlightStatus" NOT NULL DEFAULT 'SCHEDULED';
