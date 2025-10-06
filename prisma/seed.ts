import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { seedAccounts } from './account';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial accounts...');

  for (const account of seedAccounts) {
    const hashedPassword = await argon2.hash(account.password);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {}, // no overwrite for safety
      create: {
        email: account.email,
        password: hashedPassword,
        firstname: account.firstname,
        lastname: account.lastname,
        role: account.role,
      },
    });

    console.log(`✅ Created or exists: ${user.email} (${user.role})`);
  }

  console.log('🌱 Seeding complete!');
}

main()
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  }).finally(() => {
    console.log('🌱 Seed script finished.');
    prisma.$disconnect();
  });
