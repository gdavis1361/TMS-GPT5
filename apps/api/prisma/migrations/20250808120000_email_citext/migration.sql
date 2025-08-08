-- Enable CITEXT extension and enforce case-insensitive unique emails
CREATE EXTENSION IF NOT EXISTS citext;

-- Users.email to CITEXT and unique
ALTER TABLE "User" ALTER COLUMN "email" TYPE CITEXT USING email::citext;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'User_email_ci_key'
  ) THEN
    CREATE UNIQUE INDEX "User_email_ci_key" ON "User" ("email");
  END IF;
END $$;

-- Contacts.email to CITEXT and unique
ALTER TABLE "Contact" ALTER COLUMN "email" TYPE CITEXT USING email::citext;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Contact_email_ci_key'
  ) THEN
    CREATE UNIQUE INDEX "Contact_email_ci_key" ON "Contact" ("email");
  END IF;
END $$;


