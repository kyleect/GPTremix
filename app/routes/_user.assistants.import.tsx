import type { AssistantContextMessage } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { createAssistant } from "~/models/assistant.server";

import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const importForAssistantJson = formData.get("import");

  if (
    typeof importForAssistantJson !== "string" ||
    importForAssistantJson.length === 0
  ) {
    return json(
      { errors: { import: "Assistant import is required" } },
      { status: 400 }
    );
  }

  try {
    const importForAssistant = JSON.parse(importForAssistantJson);

    if (
      typeof importForAssistant.name !== "string" ||
      importForAssistant.name.length === 0
    ) {
      return json(
        {
          errors: {
            import: "Invalid import for assistant. Both `name` is required",
          },
        },
        { status: 400 }
      );
    }

    let contextMessages: Pick<AssistantContextMessage, "role" | "content">[] =
      [];

    const { messages } = importForAssistant;

    if (Array.isArray(messages)) {
      const errors: string[] = [];

      messages.forEach((message, i) => {
        const { role, content } = message;

        if (typeof role !== "string" || role.length === 0) {
          errors.push(`[${i}]: role required to be a non empty string`);
        }

        if (typeof content !== "string" || content.length === 0) {
          errors.push(`[${i}]: content required to be a non empty string`);
        }
      });

      if (errors.length > 0) {
        return json({ errors: { import: errors.join(", ") } }, { status: 400 });
      }

      contextMessages = messages;
    }

    const assistant = await createAssistant({
      userId,
      name: importForAssistant.name as string,
      messages: contextMessages,
    });

    return redirect(`/assistants/${assistant.id}`);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return json(
        { errors: { import: `Invalid import for assistant: Invalid JSON` } },
        { status: 400 }
      );
    }

    if (
      e instanceof Error &&
      e.message.includes("Unique constraint failed on the fields")
    ) {
      return json(
        { errors: { import: `Assistant names must be unique!` } },
        { status: 400 }
      );
    }

    throw e;
  }
}

export default function NewAssistantPage() {
  const actionData = useActionData<typeof action>();
  const importRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.import) {
      importRef.current?.focus();
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
          <textarea
            ref={importRef}
            name="import"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6"
            aria-invalid={actionData?.errors?.import ? true : undefined}
            placeholder="Paste your exported assistant"
            aria-errormessage={
              actionData?.errors?.import ? "import-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.import && (
          <div className="pt-1 text-red-700" id="import-error">
            {actionData.errors.import}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Import
        </button>
      </div>
    </Form>
  );
}
