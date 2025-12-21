-- CreateTable
CREATE TABLE "Character" (
    "name" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "subClass" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "subRace" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "wisdom" INTEGER NOT NULL,
    "charisma" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "life" INTEGER NOT NULL,
    "maxLife" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
