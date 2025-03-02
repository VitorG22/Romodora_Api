-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL,
    "isLaunchable" BOOLEAN NOT NULL,
    "launcheRange" INTEGER NOT NULL,
    "healDiceType" INTEGER NOT NULL,
    "healDiceAmount" INTEGER NOT NULL,
    "healEffectArea" INTEGER NOT NULL,
    "damageDiceType" INTEGER NOT NULL,
    "damageDiceAmount" INTEGER NOT NULL,
    "damageType" TEXT NOT NULL,
    "damageEffectArea" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_id_key" ON "Item"("id");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
