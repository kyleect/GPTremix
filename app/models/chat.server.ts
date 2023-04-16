import type { User, Chat, Message } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Chat } from "@prisma/client";

export function getChat({
  id,
  userId,
}: Pick<Chat, "id"> & {
  userId: User["id"];
}) {
  return prisma.chat.findFirst({
    select: { id: true, messages: true, systemContext: true },
    where: { id, userId },
  });
}

export function getChatListItems({ userId }: { userId: User["id"] }) {
  return prisma.chat.findMany({
    where: { userId },
    select: { id: true, messages: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createChat(
  { userId }: { userId: User["id"] },
  systemContext: string
) {
  return prisma.chat.create({
    data: {
      systemContext,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function addMessage({
  chatId,
  role,
  content,
}: {
  chatId: Chat["id"];
  role: Message["role"];
  content: Message["content"];
}) {
  return prisma.message.create({
    data: {
      role,
      content,
      chat: {
        connect: {
          id: chatId,
        },
      },
    },
  });
}

export function getChatMessages({ chatId }: { chatId: Chat["id"] }) {
  return prisma.message.findMany({
    where: {
      chatId,
    },
    select: {
      role: true,
      content: true,
    },
  });
}

export function deleteChat({
  id,
  userId,
}: Pick<Chat, "id"> & { userId: User["id"] }) {
  return prisma.chat.deleteMany({
    where: { id, userId },
  });
}
