-- CreateTable
CREATE TABLE "UnitAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "GoalInstallment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "OwnerInstallmentObligation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ContributionAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);
