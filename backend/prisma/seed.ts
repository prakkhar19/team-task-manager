import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password,
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      name: "Member User",
      email: "member@example.com",
      password,
    },
  });

  // Project
  let project = await prisma.project.findFirst({
    where: { title: "Demo Project" },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        title: "Demo Project",
        description: "A demo project with sample tasks",
        createdBy: adminUser.id,
        members: {
          create: [
            { userId: adminUser.id, role: "Admin" },
            { userId: memberUser.id, role: "Member" },
          ],
        },
      },
    });
  }

  // Tasks
  const tasksCount = await prisma.task.count({ where: { projectId: project.id } });
  if (tasksCount === 0) {
    const tasksData = [
      {
        projectId: project.id,
        title: "Setup infrastructure",
        description: "Initialize backend and database",
        status: "Done",
        priority: "High",
        createdBy: adminUser.id,
        assignedTo: adminUser.id,
      },
      {
        projectId: project.id,
        title: "Implement frontend UI",
        description: "Create React components for dashboard",
        status: "In Progress",
        priority: "Medium",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdBy: adminUser.id,
        assignedTo: memberUser.id,
      },
      {
        projectId: project.id,
        title: "Write documentation",
        description: "Update README with setup instructions",
        status: "To Do",
        priority: "Low",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue (1 day ago)
        createdBy: adminUser.id,
        assignedTo: memberUser.id,
      },
    ];

    await Promise.all(
      tasksData.map((task) => prisma.task.create({ data: task }))
    );
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
