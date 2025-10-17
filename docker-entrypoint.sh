#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed || echo "Seeding failed or already seeded, continuing..."

echo "Starting application..."
exec node dist/main.js
