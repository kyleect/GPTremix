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
        select: { id: true, name: true, prompt: true, chats: true, contextMessages: true },
        where: { id, userId },
    });
}

export function getAssistants({ userId }: { userId: User["id"] }) {
    return prisma.assistant.findMany({
        where: { userId },
        select: { id: true, name: true, prompt: true },
        orderBy: { updatedAt: "desc" },
    });
}

export function createAssistant(
    {
        userId,
        name,
        prompt,
        messages
    }: {
        userId: User["id"],
        name: Assistant["name"],
        prompt: Assistant["prompt"],
        messages: Pick<AssistantContextMessage, "role" | "content">[]
    }
) {
    return prisma.assistant.create({
        data: {
            name,
            prompt,
            contextMessages: {
                create: messages
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
