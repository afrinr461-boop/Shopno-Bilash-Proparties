-- CreateTable
CREATE TABLE "OwnerCredential" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerCredential_phone_key" ON "OwnerCredential"("phone");
