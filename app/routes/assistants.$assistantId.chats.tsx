import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
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

export default function AssistantDetailsChatsPage() {
    const data = useLoaderData<typeof loader>();

    return (
        <>
            <ol className="mt-2">
                <li><Link to={`/chats/new?assistantId=${data.assistant.id}`} className="block py-2 text-blue-700">
                    Start New Chat
                </Link></li>
                {data.assistant.chats.map(chat => {
                    return (
                        <li key={chat.id} className="py-2">
                            <Link to={`/chats/${chat.id}`} className=" text-blue-700 mt-3">{chat.id}</Link>
                        </li>
                    );
                })}
            </ol>
        </>
    );
}