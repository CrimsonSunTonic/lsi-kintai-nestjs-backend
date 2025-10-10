import { PrismaClient, Attendance } from '@prisma/client';
import * as argon2 from 'argon2';
import { seedAccounts } from './account';

const prisma = new PrismaClient();

async function seedUsers() {
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

  console.log('🌱 User seeding complete!');
}

async function seedAttendance() {
  console.log('\n🌱 Seeding attendance test data (only for user1–user3)...');

  // ✅ Only include the specific 3 users
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['user1@lsi.co.jp', 'user2@lsi.co.jp', 'user3@lsi.co.jp'],
      },
    },
  });

  if (users.length === 0) {
    console.log('⚠️ No target users found. Please seed accounts first.');
    return;
  }

  const start = new Date('2024-01-01');
  const end = new Date('2024-12-31');
  const records: Partial<Attendance>[] = [];

  for (const user of users) {
    let current = new Date(start);

    while (current <= end) {
      const day = current.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
      if (day !== 0 && day !== 6) {
        const checkIn = new Date(current);
        // Set time to 9:00 JST (UTC+9)
        checkIn.setUTCHours(0, 0, 0, 0); // 9:00 JST = 0:00 UTC

        const checkOut = new Date(current);
        if (day === 1) {
          // Monday: 21:00 JST = 12:00 UTC
          checkOut.setUTCHours(12, 0, 0, 0);
        } else if (day === 2) {
          // Tuesday: 23:00 JST = 14:00 UTC
          checkOut.setUTCHours(14, 0, 0, 0);
        } else {
          // Other weekdays: 18:00 JST = 9:00 UTC
          checkOut.setUTCHours(9, 0, 0, 0);
        }

        records.push({
          userId: user.id,
          date: checkIn,
          status: 'checkin',
          latitude: 34.3853,
          longitude: 132.4553,
        });

        records.push({
          userId: user.id,
          date: checkOut,
          status: 'checkout',
          latitude: 34.3853,
          longitude: 132.4553,
        });
      }

      current.setDate(current.getDate() + 1);
    }
  }

  console.log(`➡️ Inserting ${records.length} attendance records...`);

  const chunkSize = 1000;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await prisma.attendance.createMany({
      data: chunk as any,
      skipDuplicates: true,
    });
  }

  console.log('✅ Attendance seeding complete!');
}

async function main() {
  console.log('🚀 Starting full seed process...\n');

  await seedUsers();
  await seedAttendance();

  console.log('\n🎉 All seed data successfully inserted!');
}

main()
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seed script finished.');
  });
