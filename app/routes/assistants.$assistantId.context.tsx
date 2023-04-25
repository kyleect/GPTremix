import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { ContextChatMessage } from "~/components/ChatMessage";
import { getAssistant } from "~/models/assistant.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
    const userId = await requireUserId(request);
    invariant(params.assistantId, "assistantId not found");

    const assistant = await getAssistant({ userId, id: params.assistantId });

    if (!assistant) {
        throw new Response("Not Found", { status: 404 });
    }

    return json({ assistant });
}

export default function AssistantDetailsContextPage() {
    const data = useLoaderData<typeof loader>();

    return (
        <>
            <ol>
                {data.assistant.contextMessages.map((contextMessage, i) => {
                    return (
                        <li key={i}>
                            <ContextChatMessage
                                authorOrRole={contextMessage.role}
                                content={contextMessage.content}
                            />
                        </li>
                    )
                })}
            </ol>
        </>
    );
}