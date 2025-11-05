-- CreateTable
CREATE TABLE "public"."Map" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastModify" TIMESTAMP(3) NOT NULL,
    "sizeX" INTEGER NOT NULL,
    "sizeY" INTEGER NOT NULL,
    "layers" JSONB NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Map" ADD CONSTRAINT "Map_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
