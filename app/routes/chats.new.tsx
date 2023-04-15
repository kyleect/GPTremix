import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { createChat } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const systemContext = formData.get("systemContext");

  if (typeof systemContext !== "string" || systemContext.length === 0) {
    return json(
      { errors: { systemContext: "System Context is required" } },
      { status: 400 }
    );
  }

  const chat = await createChat({ userId }, systemContext);

  return redirect(`/chats/${chat.id}`);
}

export default function NewChatPage() {
  const actionData = useActionData<typeof action>();
  const systemContextRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.systemContext) {
      systemContextRef.current?.focus();
    }
  }, [actionData]);

  return (
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
          <span>System Context: </span>
          <textarea
            ref={systemContextRef}
            name="systemContext"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.systemContext ? true : undefined}
            placeholder="You are a helpful assistant."
            aria-errormessage={
              actionData?.errors?.systemContext
                ? "system-context-error"
                : undefined
            }
          />
        </label>
        {actionData?.errors?.systemContext && (
          <div className="pt-1 text-red-700" id="system-context-error">
            {actionData.errors.systemContext}
          </div>
        )}
      </div>

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
