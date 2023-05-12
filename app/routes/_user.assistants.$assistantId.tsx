import type { LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
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
      <h3 className="text-xl font-bold sm:text-2xl">{data.assistant.name}</h3>

      <Link
        to={`/chats/new?assistantId=${data.assistant.id}`}
        className="block py-2 text-blue-700"
      >
        Start New Chat
      </Link>

      <ul className="my-10 flex justify-between text-center">
        <li className="grow">
          <NavLink
            className={({ isActive }) =>
              `${
                isActive ? "bg-slate-800 font-bold text-slate-100 " : undefined
              } block p-3`
            }
            to={`/assistants/${data.assistant.id}`}
            end
          >
            Details
          </NavLink>
        </li>
        <li className="grow">
          <NavLink
            className={({ isActive }) =>
              `${
                isActive ? "bg-slate-800 font-bold text-slate-100" : undefined
              } block p-3`
            }
            to={`/assistants/${data.assistant.id}/context`}
          >
            Context
          </NavLink>
        </li>
        <li className="grow">
          <NavLink
            className={({ isActive }) =>
              `${
                isActive ? "bg-slate-800 font-bold text-slate-100" : undefined
              } block p-3`
            }
            to={`/assistants/${data.assistant.id}/chats`}
            end
          >
            Chats
          </NavLink>
        </li>
        <li className="grow">
          <NavLink
            className={({ isActive }) =>
              `${
                isActive ? "bg-slate-800 font-bold text-slate-100" : undefined
              } block p-3`
            }
            to={`/assistants/${data.assistant.id}/export`}
            end
          >
            Export
          </NavLink>
        </li>
        <li className="grow">
          <NavLink
            className={({ isActive }) =>
              `${
                isActive ? "bg-slate-800 font-bold text-slate-100" : undefined
              } block p-3`
            }
            to={`/_user.assistants/${data.assistant.id}/fork`}
            end
          >
            Fork
          </NavLink>
        </li>
      </ul>

      <div className="my-5">
        <Outlet />
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
