import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { ContextChatMessage } from "~/components/ChatMessage";
import type { loader as parentLoader } from "~/routes/_user.assistants.$assistantId";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export default function AssistantDetailsContextIndexPage() {
  const data = useMatchesData<typeof parentLoader>(
    "routes/_user.assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  return (
    <>
      <ol>
        {data.assistant.contextMessages.map((contextMessage, i) => {
          return (
            <li key={i} className="mb-5">
              <ContextChatMessage
                authorOrRole={contextMessage.assistantContextMessage.role}
                content={contextMessage.assistantContextMessage.content}
                compact
              />
            </li>
          );
        })}
      </ol>

      <div className="my-5">
        <Link
          to="edit"
          className="rounded bg-gray-400 px-4 py-2  text-white hover:bg-gray-500"
        >
          Edit
        </Link>
      </div>
    </>
  );
}
