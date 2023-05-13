import type { AssistantContextMessage } from "@prisma/client";
import { Form, Link, useActionData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React from "react";
import invariant from "tiny-invariant";
import { updateAssistantContextMessages } from "~/models/assistant.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";
import type { loader as parentLoader } from "~/routes/_user.assistants.$assistantId";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.assistantId, "assistantId required but not defined");

  const formData = await request.formData();

  const context = formData.get("context");

  const contextMessages: Pick<AssistantContextMessage, "role" | "content">[] =
    [];

  if (typeof context === "string" && context.length > 0) {
    const messagesJson = context.split("\n");

    const messageErrors: string[] = [];

    messagesJson.forEach((messageJson, i) => {
      try {
        const message = JSON.parse(messageJson);

        if (
          Array.isArray(message) ||
          Number.isInteger(message) ||
          typeof message === "boolean"
        ) {
          messageErrors.push(
            `[${i}]: object required with "role" and "content" properties`
          );
          return;
        }

        const { role, content } = message;

        if (typeof role !== "string" || role.length === 0) {
          messageErrors.push(`[${i}]: role required to be a non empty string`);
        }

        if (typeof content !== "string" || content.length === 0) {
          messageErrors.push(
            `[${i}]: content required to be a non empty string`
          );
        }

        contextMessages.push(message);
      } catch (e) {
        if (e instanceof SyntaxError) {
          messageErrors.push(`[${i}]: unable to parse as json`);
          return;
        }

        messageErrors.push(`[${i}]: unknown issue`);
      }
    });

    if (messageErrors.length > 0) {
      return json(
        { errors: { name: null, context: messageErrors } },
        { status: 400 }
      );
    }
  }

  await updateAssistantContextMessages(
    { id: params.assistantId, userId },
    contextMessages
  );

  return redirect(`/assistants/${params.assistantId}/context`);
}

export default function AssistantDetailsContextEditPage() {
  const data = useMatchesData<typeof parentLoader>(
    "routes/_user.assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  const actionData = useActionData<typeof action>();
  const contextRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.context) {
      contextRef.current?.focus();
    }
  }, [actionData]);

  const messagesJson = data.assistant.contextMessages
    .map((x) => x.assistantContextMessage)
    .map(({ role, content }) => ({
      role,
      content,
    }))
    .map((x) => JSON.stringify(x))
    .join("\n");

  return (
    <Form method="post">
      <div>
        <label className="flex w-full flex-col gap-1">
          <textarea
            ref={contextRef}
            name="context"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6"
            aria-invalid={actionData?.errors?.context ? true : undefined}
            placeholder={`{"role":"system","content":"You are a very helpful assistant!"}`}
            defaultValue={messagesJson}
            aria-errormessage={
              actionData?.errors?.context ? "context-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.context && (
          <div className="pt-1 text-red-700" id="context-error">
            {actionData.errors.context.join(", ")}
          </div>
        )}
      </div>

      <div className="space-x-5 py-5">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>

        <Link
          to={`/assistants/${data.assistant.id}/context`}
          className="rounded bg-gray-500 px-4 py-[11px] text-white hover:bg-gray-600 focus:bg-gray-400"
        >
          Cancel
        </Link>
      </div>
    </Form>
  );
}
