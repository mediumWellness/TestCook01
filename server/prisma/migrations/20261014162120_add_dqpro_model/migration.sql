-- CreateTable
CREATE TABLE "DQPro" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cpuUsagePercent" DOUBLE PRECISION,
    "memoryUsagePercent" DOUBLE PRECISION,
    "thermalStatus" TEXT,
    "powerUsageWatts" DOUBLE PRECISION,
    "lastOptimizationAt" TIMESTAMP(3),
    "optimizationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DQPro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DQPro_deviceId_key" ON "DQPro"("deviceId");
