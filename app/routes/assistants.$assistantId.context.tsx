import { Outlet } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
    await requireUserId(request);
    invariant(params.assistantId, "assistantId not found");

    return null;
}

export default function AssistantDetailsContextPage() {
    return (
        <>
            <Outlet />
        </>
    );
}