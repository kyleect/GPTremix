import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { loader as parentLoader } from "~/routes/_user.assistants.$assistantId";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export default function AssistantDetailsChatsPage() {
  const data = useMatchesData<typeof parentLoader>(
    "routes/_user.assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  return (
    <>
      <ol className="mt-2">
        {data.assistant.chats.map((chat) => {
          return (
            <li key={chat.id} className="py-2">
              <Link to={`/chats/${chat.id}`} className=" mt-3 text-blue-700">
                {chat.id}
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
