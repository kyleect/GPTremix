import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { createAssistant } from "~/models/assistant.server";

import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
    const userId = await requireUserId(request);

    const formData = await request.formData();

    const name = formData.get("name");
    const prompt = formData.get("prompt");

    if (typeof name !== "string" || name.length === 0) {
        return json(
            { errors: { name: "Name is required", prompt: null } },
            { status: 400 }
        );
    }

    if (typeof prompt !== "string" || prompt.length === 0) {
        return json(
            { errors: { name: null, prompt: "Prompt is required" } },
            { status: 400 }
        );
    }

    const assistant = await createAssistant({ userId, name, prompt });

    return redirect(`/assistants/${assistant.id}`);
}

export default function NewAssistantPage() {
    const actionData = useActionData<typeof action>();
    const nameRef = React.useRef<HTMLInputElement>(null);
    const promptRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (actionData?.errors?.name) {
            nameRef.current?.focus();
        } else if (actionData?.errors?.prompt) {
            promptRef.current?.focus();
        }
    }, [actionData]);

    return <Form
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
                <span>Name: </span>
                <input
                    ref={nameRef}
                    name="name"
                    className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
                    aria-invalid={actionData?.errors?.name ? true : undefined}
                    placeholder="Helpful Assistant"
                    aria-errormessage={
                        actionData?.errors?.prompt
                            ? "prompt-error"
                            : undefined
                    }
                />
            </label>
            {actionData?.errors?.name && (
                <div className="pt-1 text-red-700" id="prompt-error">
                    {actionData.errors.name}
                </div>
            )}
        </div>

        <div>
            <label className="flex w-full flex-col gap-1">
                <span>Prompt: </span>
                <textarea
                    ref={promptRef}
                    name="prompt"
                    rows={8}
                    className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
                    aria-invalid={actionData?.errors?.prompt ? true : undefined}
                    placeholder="You are a helpful assistant."
                    aria-errormessage={
                        actionData?.errors?.prompt
                            ? "prompt-error"
                            : undefined
                    }
                >You are a helpful assistant.</textarea>
            </label>
            {actionData?.errors?.prompt && (
                <div className="pt-1 text-red-700" id="prompt-error">
                    {actionData.errors.prompt}
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
}
