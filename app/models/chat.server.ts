import type { User, Chat, Message, Assistant } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Chat } from "@prisma/client";

export function getChat({
  id,
  userId,
}: Pick<Chat, "id"> & {
  userId: User["id"];
}) {
  return prisma.chat.findFirst({
    select: { id: true, messages: true, assistant: true },
    where: { id, userId },
  });
}

export function getChatListItems({ userId }: { userId: User["id"] }) {
  return prisma.chat.findMany({
    where: { userId },
    select: { id: true, messages: true, assistant: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createChat(
  { userId, assistantId }: { userId: User["id"], assistantId: Assistant["id"] }
) {
  return prisma.chat.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      assistant: {
        connect: {
          id: assistantId
        }
      }
    },
  });
}

export function addMessage({
  chatId,
  role,
  content,
  tokens
}: {
  chatId: Chat["id"];
  role: Message["role"];
  content: Message["content"];
  tokens: Message["tokens"]
}) {
  return prisma.message.create({
    data: {
      role,
      content,
      tokens,
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
      tokens: true
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
