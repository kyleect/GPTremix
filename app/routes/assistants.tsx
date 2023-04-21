import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import LoggedInHeader from "~/components/LoggedInHeader";
import { getAssistants } from "~/models/assistant.server";

import { requireUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "GPTremix" }];

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request);
    const assistants = await getAssistants({ userId });
    return json({ assistants });
}

export default function AssistantsPage() {
    const data = useLoaderData<typeof loader>();

    return (
        <div className="flex h-full min-h-screen flex-col">
            <LoggedInHeader />

            <main className="flex h-full bg-white">
                <div className="h-full w-1/6 border-r bg-gray-50">
                    <Link to="new" className="block p-4 text-xl text-blue-500">
                        + New Assistant
                    </Link>

                    <hr />

                    {data.assistants.length === 0 ? (
                        <p className="p-4">No assistants yet</p>
                    ) : (
                        <ol>
                            {data.assistants.map((assistant) => (
                                <li key={assistant.id}>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `block overflow-hidden text-ellipsis border-b p-4 text-xl ${isActive ? "bg-white" : ""
                                            }`
                                        }
                                        to={assistant.id}
                                    >
                                        🤖&nbsp;{assistant.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="w-5/6 flex-1 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
