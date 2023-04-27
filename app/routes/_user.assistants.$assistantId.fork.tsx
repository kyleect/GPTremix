import React from "react";
import invariant from "tiny-invariant";
import { useMatchesData } from "~/utils";
import type { loader as parentLoader } from "~/routes/_user.assistants.$assistantId";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Form, useActionData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { createAssistant, getAssistant } from "~/models/assistant.server";
import { Response } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.assistantId, "assistantId not found");

  const assistant = await getAssistant({ id: params.assistantId, userId });

  if (!assistant) {
    throw new Response(null, {
      status: 404,
    });
  }

  const formData = await request.formData();

  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Name is required", context: null } },
      { status: 400 }
    );
  }

  const messages = assistant.contextMessages.map(({ role, content }) => ({
    role,
    content,
  }));

  try {
    const forkedAssistant = await createAssistant({ userId, name, messages });

    return redirect(`/assistants/${forkedAssistant.id}`);
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes("Unique constraint failed on the fields")
    ) {
      return json(
        { errors: { name: `Assistant names must be unique!` } },
        { status: 400 }
      );
    }

    throw e;
  }
}

export default function AssistantDetailsForkPage() {
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);

  const data = useMatchesData<typeof parentLoader>(
    "routes/_user.assistants.$assistantId"
  );

  invariant(data, "Unable to load assistant data from parent route");

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <Form method="post">
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

        <div className="mt-5">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Fork
          </button>
        </div>
      </Form>
    </>
  );
}
