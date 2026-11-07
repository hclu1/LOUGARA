-- v0.19.0 : moderation Lougara des produits du catalogue (textes + images)
-- A executer sur la base Supabase/PostgreSQL (ou `npx prisma db push`).
-- Tous les produits existants passent en PENDING : ils ne seront visibles au catalogue
-- qu'apres validation explicite par un moderateur Lougara.

DO $$ BEGIN
  CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "moderationNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3);
