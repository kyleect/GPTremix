import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
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

export default function AssistantDetailsExportPage() {
    const data = useLoaderData<typeof loader>();

    const assistantExport = JSON.stringify({
        name: data.assistant.name,
        messages: data.assistant.contextMessages.map(({ role, content }) => ({ role, content }))
    });

    const copy = React.useCallback(() => {
        navigator.clipboard.writeText(assistantExport);
    }, [assistantExport]);

    return (
        <>
            <div className="flex justify-between">
                <button
                    type="button"
                    className="grow-1 rounded bg-gray-400 px-4 py-2 font-medium text-white hover:bg-gray-500"
                    onClick={copy}>
                    Copy
                </button>
                <pre className="grow bg-gray-100 p-2 truncate ...">
                    {assistantExport}
                </pre>
            </div>
        </>
    );
}