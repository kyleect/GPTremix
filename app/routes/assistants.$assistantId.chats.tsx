import { Link } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { loader as parentLoader } from "~/routes/assistants.$assistantId";
import { useMatchesData } from "~/utils";

export default function AssistantDetailsChatsPage() {
  const data = useMatchesData<typeof parentLoader>(
    "routes/assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  return (
    <>
      <ol className="mt-2">
        <li>
          <Link
            to={`/chats/new?assistantId=${data.assistant.id}`}
            className="block py-2 text-blue-700"
          >
            Start New Chat
          </Link>
        </li>
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
