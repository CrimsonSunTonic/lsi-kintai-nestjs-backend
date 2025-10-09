#!/bin/sh

# Run migrations on dev database
echo "Running migrations on dev-db..."
npx prisma migrate deploy

# Run seed only for dev environment
echo "Seeding dev-db..."  
npx ts-node prisma/seed.ts

echo "🚀 Starting the NestJS server..."
npm run start:dev
