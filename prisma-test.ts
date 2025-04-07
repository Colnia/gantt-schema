import prisma from './lib/prisma';

async function testPrisma() {
  console.log("Attempting to connect and query with Prisma...");
  try {
    const project = await prisma.project.findFirst();
    if (project) {
      console.log("Successfully fetched a project:", project.name);
    } else {
      console.log("Successfully connected, but no projects found.");
    }
  } catch (error) {
    console.error("Prisma test failed:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  }
}

testPrisma(); 