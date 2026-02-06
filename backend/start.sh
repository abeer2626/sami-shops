#!/bin/bash
set -e

echo "Starting SamiShops Backend..."

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z ${DATABASE_URL##*@} 5432 2>/dev/null; do
    sleep 1
done
echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
prisma migrate deploy || echo "Migrations already applied or no migrations to run"

# Generate Prisma client (ensure it's up to date)
echo "Generating Prisma client..."
prisma generate

echo "Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
