import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { getAssistant, getAssistants } from "~/models/assistant.server";

import { createChat } from "~/models/chat.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const assistants = await getAssistants({ userId });

  return json({ assistants });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const assistantId = formData.get("assistant");

  if (typeof assistantId !== "string" || assistantId.length === 0) {
    return json(
      { errors: { assistant: "Assistant is required" } },
      { status: 400 }
    );
  }

  const assistant = await getAssistant({ id: assistantId, userId });

  invariant(assistant, "Assistant not found");

  const chat = await createChat({ userId, assistantId: assistant.id });

  return redirect(`/chats/${chat.id}`);
}

export default function NewChatPage() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const assistantRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.assistant) {
      assistantRef.current?.focus();
    }
  }, [actionData]);

  const needsAnAssissant = data.assistants.length === 0;

  return (
    needsAnAssissant ? (<Link to="/assistants/new" className="font-medium text-blue-700 mt-3">Create a new assistant</Link>) :
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="text-xl sm:text-2xl mb-2">Assistant</span>
            <select
              ref={assistantRef}
              name="assistant"
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6"
              aria-invalid={actionData?.errors?.assistant ? true : undefined}
              placeholder="You are a helpful assistant."
              aria-errormessage={
                actionData?.errors?.assistant
                  ? "assistant-error"
                  : undefined
              }
            >
              {data.assistants.map(assistant => {
                return <option key={assistant.id} value={assistant.id}>{assistant.name}</option>;
              })}
            </select>
          </label>
          {actionData?.errors?.assistant && (
            <div className="pt-1 text-red-700" id="assistant-error">
              {actionData.errors.assistant}
            </div>
          )}
        </div>

        <p>Or <Link to="/assistants/new" className="font-medium text-blue-700 mt-3">create a new assistant</Link></p>

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
  );
}
