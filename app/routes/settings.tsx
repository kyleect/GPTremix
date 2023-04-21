import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUser } from "~/session.server";
import LoggedInHeader from "~/components/LoggedInHeader";

export const meta: V2_MetaFunction = () => [{ title: "GPTremix" }];

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request);

    return json({ user });
}

export default function ChatsPage() {
    const data = useLoaderData<typeof loader>();

    return (
        <div className="flex h-full min-h-screen flex-col">
            <LoggedInHeader />

            <main className="flex h-full bg-white text-sm sm:text-base">
                <div className="h-full w-3/12 lg:w-2/12  border-r bg-gray-50">
                    <ol>
                        <li>
                            <NavLink
                                className={({ isActive }) =>
                                    `block overflow-hidden text-ellipsis border-b p-4 ${isActive ? "bg-white" : ""
                                    }`
                                }
                                to="apikey"
                            >
                                OpenAI Key
                            </NavLink>
                        </li>
                    </ol>
                </div>

                <div className="w-9/12 lg:w-10/12 flex-1 p-6">
                    <div className="mb-5">
                        <p className="font-bold">Email</p>
                        <p>{data.user.email}</p>
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    );
}
