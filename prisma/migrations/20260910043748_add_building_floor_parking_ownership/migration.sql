-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Floor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Parking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "OwnershipRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL
);
