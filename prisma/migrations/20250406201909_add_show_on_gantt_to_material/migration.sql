-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaterialDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "expectedDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "trackingNumber" TEXT,
    "contactPerson" TEXT,
    "notes" TEXT,
    "showOnGantt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialDelivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialDelivery_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MaterialDelivery" ("actualDate", "contactPerson", "cost", "createdAt", "description", "expectedDate", "id", "notes", "phaseId", "projectId", "quantity", "status", "supplier", "trackingNumber", "unit", "updatedAt") SELECT "actualDate", "contactPerson", "cost", "createdAt", "description", "expectedDate", "id", "notes", "phaseId", "projectId", "quantity", "status", "supplier", "trackingNumber", "unit", "updatedAt" FROM "MaterialDelivery";
DROP TABLE "MaterialDelivery";
ALTER TABLE "new_MaterialDelivery" RENAME TO "MaterialDelivery";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
