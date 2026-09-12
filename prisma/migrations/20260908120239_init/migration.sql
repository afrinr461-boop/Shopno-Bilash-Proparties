-- CreateTable
CREATE TABLE "Credential" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "UnitContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ConstructionPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ConstructionTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectBudget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "MaterialCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Shareholder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Shareholding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Landowner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "LandownerAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_email_key" ON "Credential"("email");
