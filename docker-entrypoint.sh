#!/bin/sh

echo "Running migrations on dev-db..."
npx prisma migrate deploy

echo "Seeding dev-db..."  
npx ts-node prisma/seed.ts

echo "🚀 Starting the NestJS server..."
npm run start:dev