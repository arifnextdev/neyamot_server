import { PrismaClient, Role, ProductType, ProductGrading, BillingCycle, ProductStatus, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminEmail = 'arif@gmail.com';
  const adminPasswordPlain = 'Admin@12345';
  const passwordHash = await bcrypt.hash(adminPasswordPlain, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Super Admin',
      username: 'admin',
      phone: '0000000000',
      roles: [Role.ADMIN],
      password: passwordHash,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      username: 'admin',
      phone: '0000000000',
      roles: [Role.ADMIN],
      password: passwordHash,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      userInfo: {
        create: {
          bio: 'Seed admin user',
          country: 'BD',
        },
      },
    },
  });

  // Seed products (avoid duplicates by checking name+type)
  const products = [
    {
      name: 'Basic Domain',
      type: ProductType.DOMAIN,
      grade: ProductGrading.BASIC,
      description: '1 year .com domain registration',
      price: 10.0,
      billingCycle: BillingCycle.ANNUALLY,
    },
    {
      name: 'Starter Hosting',
      type: ProductType.HOSTING,
      grade: ProductGrading.BASIC,
      description: 'Shared hosting 10GB SSD',
      price: 25.0,
      billingCycle: BillingCycle.MONTHLY,
    },
    {
      name: 'SSL Certificate',
      type: ProductType.SSL,
      grade: ProductGrading.PREMIUM,
      description: 'DV SSL certificate',
      price: 15.0,
      billingCycle: BillingCycle.ANNUALLY,
    },
    {
      name: 'Business Email',
      type: ProductType.EMAIL,
      grade: ProductGrading.BASIC,
      description: 'Professional email per mailbox',
      price: 2.0,
      billingCycle: BillingCycle.MONTHLY,
    },
    {
      name: 'VPS Small',
      type: ProductType.VPS,
      grade: ProductGrading.BASIC,
      description: '1 vCPU, 2GB RAM, 40GB SSD',
      price: 8.0,
      billingCycle: BillingCycle.MONTHLY,
    },
  ];

  for (const p of products) {
    const exists = await prisma.product.findFirst({
      where: { name: p.name, type: p.type },
    });
    if (!exists) {
      await prisma.product.create({
        data: {
          name: p.name,
          type: p.type,
          grade: p.grade,
          description: p.description,
          price: p.price,
          billingCycle: p.billingCycle,
          status: ProductStatus.ACTIVE,
          isActive: true,
          isDeleted: false,
          quantity: 100,
          vat: 0,
          tax: 0,
        },
      });
    }
  }

  console.log('Seed completed: admin user and 5 products ensured.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
