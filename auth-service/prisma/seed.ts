import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Check if an admin already exists to avoid duplicates
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true },
    });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      return;
    }

    // Hash the default password
    const hashedPassword = bcrypt.hashSync("admin123", 10);

    // Create default admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log("Default admin user created:", {
      id: adminUser.id,
      email: adminUser.email,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed().then(() => console.log("Seeding completed."));
