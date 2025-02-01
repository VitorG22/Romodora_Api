-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,
    "token_expire" TIMESTAMP(3),
    "picture" TEXT,
    "party" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "banner" TEXT NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartysOn" (
    "id" TEXT NOT NULL,
    "journey_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,

    CONSTRAINT "PartysOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "health" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "subClass" TEXT,
    "race" TEXT NOT NULL,
    "subRace" TEXT,
    "bag" TEXT,
    "strength" TEXT NOT NULL,
    "dexterity" TEXT NOT NULL,
    "constitution" TEXT NOT NULL,
    "intelligence" TEXT NOT NULL,
    "wisdom" TEXT NOT NULL,
    "charisma" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_id_key" ON "Journey"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PartysOn_id_key" ON "PartysOn"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PartysOn_journey_id_key" ON "PartysOn"("journey_id");

-- CreateIndex
CREATE UNIQUE INDEX "PartysOn_host_id_key" ON "PartysOn"("host_id");

-- CreateIndex
CREATE UNIQUE INDEX "Character_id_key" ON "Character"("id");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartysOn" ADD CONSTRAINT "PartysOn_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
