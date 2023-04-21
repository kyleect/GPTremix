import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Link,
    isRouteErrorResponse,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";
import React from "react";
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

export default function AssistantDetailsPage() {
    const data = useLoaderData<typeof loader>();

    const assistantExport = JSON.stringify({ name: data.assistant.name, prompt: data.assistant.prompt });

    const copy = React.useCallback(() => {
        navigator.clipboard.writeText(assistantExport);
    }, [assistantExport]);

    return (
        <div>
            <h3 className="text-xl sm:text-2xl font-bold">{data.assistant.name}</h3>
            <p className="text-md sm:text-lg mt-5 italic">{data.assistant.prompt}</p>

            <div className="mt-5">
                <h4 className="text-lg sm:text-xl font-medium">Chats</h4>

                <ol className="mt-2">
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

                <pre className="mt-5 truncate ...">
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
