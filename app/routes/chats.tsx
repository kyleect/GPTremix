import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { getChatListItems } from "~/models/chat.server";
import LoggedInHeader from "~/components/LoggedInHeader";

export const meta: V2_MetaFunction = () => [{ title: "GPTremix" }];

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const chatListItems = await getChatListItems({ userId });
  return json({ chatListItems });
}

export default function ChatsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <LoggedInHeader />

      <main className="flex h-full bg-white">
        <div className="h-full w-1/6 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Chat
          </Link>

          <hr />

          {data.chatListItems.length === 0 ? (
            <p className="p-4">No chats yet</p>
          ) : (
            <ol>
              {data.chatListItems.map((chat) => (
                <li key={chat.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block overflow-hidden text-ellipsis border-b p-4 text-xl ${isActive ? "bg-white" : ""
                      }`
                    }
                    to={chat.id}
                  >
                    📝&nbsp;Chat With {chat.assistant.name}
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
