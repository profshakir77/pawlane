#!/bin/sh
# Runs during the Vercel build. Skipped until a database is attached.
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set: skipping schema push"
  exit 0
fi
npx prisma db push --skip-generate
if [ "$SEED_DEMO" = "true" ]; then
  npx tsx prisma/seed.ts
fi
