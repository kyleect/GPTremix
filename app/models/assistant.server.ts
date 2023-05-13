import type { User, Assistant, AssistantContextMessage } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Chat } from "@prisma/client";

export function getAssistant({
  id,
  userId,
}: Pick<Assistant, "id"> & {
  userId: User["id"];
}) {
  return prisma.assistant.findFirst({
    select: {
      id: true,
      name: true,
      chats: true,
      contextMessages: {
        select: {
          assistantContextMessage: {
            select: {
              id: true,
              role: true,
              content: true,
            },
          },
        },
      },
      createdAt: true,
    },
    where: { id, userId },
  });
}

export function getAssistants({ userId }: { userId: User["id"] }) {
  return prisma.assistant.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createAssistant({
  userId,
  name,
  messages,
}: {
  userId: User["id"];
  name: Assistant["name"];
  messages: Pick<AssistantContextMessage, "role" | "content">[];
}) {
  const assistantMessagesWithUserId = await Promise.all(
    messages
      .map((m) => ({
        ...m,
        userId,
      }))
      .map((m) =>
        prisma.assistantContextMessage.create({
          data: m,
        })
      )
  );

  return prisma.assistant.create({
    data: {
      name,
      contextMessages: {
        create: assistantMessagesWithUserId.map((x) => ({
          assistantContextMessage: {
            connect: {
              id: x.id,
            },
          },
        })),
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteAssistant({
  id,
  userId,
}: Pick<Assistant, "id"> & { userId: User["id"] }) {
  return prisma.assistant.deleteMany({
    where: { id, userId },
  });
}

export async function updateAssistantContextMessages(
  { id, userId }: Pick<Assistant, "id"> & { userId: User["id"] },
  messages: Pick<AssistantContextMessage, "role" | "content">[]
) {
  // const assistant = await getAssistant({ id, userId });
  // invariant(assistant, "Assistant was not found");
  // await prisma.assistantContextMessage.deleteMany({
  //   where: {
  //     assistantId: id,
  //   },
  // });
  // await prisma.assistant.update({
  //   where: {
  //     id,
  //   },
  //   data: {
  //     contextMessages: {
  //       create: messages,
  //     },
  //   },
  // });
}
