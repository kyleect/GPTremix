import type { AssistantContextMessage } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as React from "react";
import { createAssistant } from "~/models/assistant.server";

import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const name = formData.get("name");
  const context = formData.get("context");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Name is required", context: null } },
      { status: 400 }
    );
  }

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

  try {
    const assistant = await createAssistant({
      userId,
      name,
      messages: contextMessages,
    });

    return redirect(`/assistants/${assistant.id}`);
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes("Unique constraint failed on the fields")
    ) {
      return json(
        { errors: { name: `Assistant names must be unique!`, context: null } },
        { status: 400 }
      );
    }

    throw e;
  }
}

export default function NewAssistantPage() {
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const contextRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.context) {
      contextRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
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
            <span className="font-bold">Name</span>
            <input
              ref={nameRef}
              name="name"
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6"
              aria-invalid={actionData?.errors?.name ? true : undefined}
              placeholder="Helpful Assistant"
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.name && (
            <div className="pt-1 text-red-700" id="name-error">
              {actionData.errors.name}
            </div>
          )}
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span className="font-bold">Context</span>
            <textarea
              ref={contextRef}
              name="context"
              rows={8}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6"
              aria-invalid={actionData?.errors?.context ? true : undefined}
              placeholder={`{"role":"system","content":"You are a very helpful assistant!"}`}
              defaultValue={`{"role":"system","content":"You are a very helpful assistant!"}`}
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

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>

      <p>
        Or{" "}
        <Link
          to="/assistants/import"
          className="mt-3 text-base font-medium text-blue-700"
        >
          import an assistant
        </Link>
      </p>
    </>
  );
}
