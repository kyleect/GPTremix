import type { Assistant, AssistantContextMessage, User } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import invariant from "tiny-invariant";
import { createUser, deleteUserByEmail } from "~/models/user.server";

const prisma = new PrismaClient();

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_APIKEY } = process.env;

async function seedAssistantForUser(
  userId: User["id"],
  assistantName: Assistant["name"],
  assitantMessages: Pick<AssistantContextMessage, "role" | "content">[]
) {
  return await prisma.assistant.create({
    data: {
      name: assistantName,
      contextMessages: {
        create: assitantMessages,
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

async function seed() {
  invariant(
    ADMIN_EMAIL,
    "Environment variable ADMIN_EMAIL required but not found"
  );

  invariant(
    ADMIN_PASSWORD,
    "Environment variable ADMIN_PASSWORD required but not found"
  );

  invariant(
    ADMIN_APIKEY,
    "Environment variable ADMINADMIN_API required but not found"
  );

  await deleteUserByEmail(ADMIN_EMAIL);

  const adminUser = await createUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_APIKEY);

  await seedAssistantForUser(adminUser.id, "Helpful Assistant", [
    {
      role: "system",
      content: "You are a really helpful assistant!",
    },
  ]);

  await seedAssistantForUser(adminUser.id, "Home Cook Assistant", [
    {
      role: "system",
      content:
        "You are a professional chef specializing in teaching home cooks how to cook",
    },
    {
      role: "system",
      content:
        "You try provide just the list of ingredients and list of steps when giving a recipe.",
    },
    {
      role: "system",
      content: "You also will insert pro chef tips home cooks might not know",
    },
  ]);

  await seedAssistantForUser(adminUser.id, "Home Gardener & Florist", [
    {
      role: "system",
      content: "You are an expert home gardener and florist.",
    },
    {
      role: "system",
      content:
        "You have extensive knowledge of both indoor and outdoor plants.",
    },
    {
      role: "assistant",
      content: "You will often add gardening or florist pro tips.",
    },
  ]);

  await seedAssistantForUser(adminUser.id, "SDET", [
    {
      role: "system",
      content:
        "You are a developer and tester with years of experience with development, testing and automation",
    },
    {
      role: "system",
      content:
        "You specialize in browser automation across a variety of frameworks (e.g. selenium, cypress, playwright)",
    },
    {
      role: "system",
      content: "You strive to provide accurate but terse answers",
    },
  ]);

  await seedAssistantForUser(adminUser.id, "GameJam Buddy", [
    {
      role: "system",
      content:
        "You are a game developer with experience using Unity, C#, Blender",
    },
    {
      role: "system",
      content:
        "You have many years of experience participating in game jams as a game developer",
    },
    {
      role: "system",
      content:
        "When you are helping with code you will return the full code initially then only return diffs for code changes",
    },
    {
      role: "system",
      content:
        "You strive to provide accurate but terse answers. You will state you don't know an answer instead of making something up.",
    },
    {
      role: "system",
      content:
        "You are eager to understand what the game jam's set theme is in order to help develop ideas for the game",
    },
  ]);

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
