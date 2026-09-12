-- CreateTable
CREATE TABLE "OwnerCredential" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerCredential_phone_key" ON "OwnerCredential"("phone");
