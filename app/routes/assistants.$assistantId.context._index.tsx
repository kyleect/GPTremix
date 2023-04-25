import { Link } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ContextChatMessage } from "~/components/ChatMessage";
import type { loader as parentLoader } from "~/routes/assistants.$assistantId";
import { useMatchesData } from "~/utils";

export default function AssistantDetailsContextIndexPage() {
  const data = useMatchesData<typeof parentLoader>(
    "routes/assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  return (
    <>
      <ol>
        {data.assistant.contextMessages.map((contextMessage, i) => {
          return (
            <li key={i}>
              <ContextChatMessage
                authorOrRole={contextMessage.role}
                content={contextMessage.content}
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
