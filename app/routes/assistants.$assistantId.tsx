import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    isRouteErrorResponse,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";
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

    return (
        <div>
            <h3 className="text-2xl font-bold">{data.assistant.name}</h3>
            <p>{data.assistant.prompt}</p>
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
