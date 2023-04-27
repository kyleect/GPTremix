import { Form } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteAssistant } from "~/models/assistant.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";
import type { loader as parentLoader } from "~/routes/_user.assistants.$assistantId";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.assistantId, "assistantId not found");

  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteAssistant({ userId, id: params.assistantId });

    return redirect("/assistants");
  }

  return new Response(null, {
    status: 404,
  });
}

export default function AssistantDetailsIndexPage() {
  const data = useMatchesData<typeof parentLoader>(
    "routes/assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  return (
    <>
      <p>Chats: {data.assistant.chats.length}</p>
      <p>Created: {data.assistant.createdAt}</p>
      <Form
        method="post"
        className="my-5"
        onSubmit={(event) => {
          if (!confirm("Are you sure you want to delete this assistant?")) {
            event.preventDefault();
          }
        }}
      >
        <button
          name="intent"
          value="delete"
          className="rounded-md bg-gray-400 px-4 py-2 font-medium text-white hover:bg-gray-500"
        >
          Delete
        </button>
      </Form>
    </>
  );
}
