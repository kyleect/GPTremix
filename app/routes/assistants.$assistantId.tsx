import { ActionArgs, LoaderArgs, Response } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Form,
    Link,
    isRouteErrorResponse,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import { ContextChatMessage } from "~/components/ChatMessage";
import { deleteAssistant, getAssistant } from "~/models/assistant.server";

import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
    const userId = await requireUserId(request);
    invariant(params.assistantId, "assistantId not found");

    const formData = await request.formData();

    const intent = formData.get("intent");

    if (intent === "delete") {
        await deleteAssistant({ userId, id: params.assistantId });

        return redirect("/assistants");
    }

    return new Response(null, {
        status: 404
    });
}

export async function loader({ request, params }: LoaderArgs) {
    const userId = await requireUserId(request);
    invariant(params.assistantId, "assistantId not found");

    const assistant = await getAssistant({ userId, id: params.assistantId });

    if (!assistant) {
        throw new Response("Not Found", { status: 404 });
    }

    return json({ assistant });
}

export default function AssistantDetailsPage() {
    const data = useLoaderData<typeof loader>();

    const assistantExport = JSON.stringify({
        name: data.assistant.name,
        messages: data.assistant.contextMessages.map(({ role, content }) => ({ role, content }))
    });

    const copy = React.useCallback(() => {
        navigator.clipboard.writeText(assistantExport);
    }, [assistantExport]);

    return (
        <div>
            <h3 className="text-xl sm:text-2xl font-bold">{data.assistant.name}</h3>

            <Form method="post" className="mt-5">
                <button name="intent" value="delete" className="rounded-md bg-gray-400 px-4 py-3 font-medium text-white hover:bg-gray-500">Delete</button>
            </Form>

            <div className="my-5">
                <h4 className="text-lg sm:text-xl font-medium mb-5">Context</h4>

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
            </div>


            <div className="mt-5">
                <h4 className="text-lg sm:text-xl font-medium">Chats</h4>

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
            </div>

            <div className="mt-5">
                <h4 className="text-lg sm:text-xl font-medium">Export</h4>

                <pre className="mt-5  truncate ...">
                    {assistantExport}
                </pre>

                <button type="button" className="rounded-md bg-gray-400 px-4 py-3 mt-5 font-medium text-white hover:bg-gray-500" onClick={copy}>Copy</button>
            </div>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (error instanceof Error) {
        return <div>An unexpected error occurred: {error.message}</div>;
    }

    if (!isRouteErrorResponse(error)) {
        return <h1>Unknown Error</h1>;
    }

    if (error.status === 404) {
        return <div>Assistant not found</div>;
    }

    return <div>An unexpected error occurred: {error.statusText}</div>;
}
