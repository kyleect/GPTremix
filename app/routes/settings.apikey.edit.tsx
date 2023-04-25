import { Form, Link, useActionData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React from "react";
import { updateUserApiKey } from "~/models/user.server";
import { requireUser } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

  const formData = await request.formData();

  const apikey = formData.get("apikey");

  if (typeof apikey !== "string" || apikey.length === 0) {
    return json({ errors: { apikey: "API Key is required" } }, { status: 400 });
  }

  await updateUserApiKey(user.id, apikey);

  return redirect("/settings/apikey");
}

export default function SettingsApiKeyEditPage() {
  const actionData = useActionData<typeof action>();
  const apiKeyRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <div className="mt-5">
      <p className="font-bold">New OpenAI API Key</p>
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
              autoFocus
              ref={apiKeyRef}
              name="apikey"
              rows={8}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6"
              aria-invalid={actionData?.errors?.apikey ? true : undefined}
              aria-errormessage={
                actionData?.errors?.apikey ? "apikey-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.apikey && (
            <div className="pt-1 text-red-700" id="apikey-error">
              {actionData.errors.apikey}
            </div>
          )}
        </div>

        <div className="mt-5 space-x-5">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-[10px] text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>

          <Link
            to="/settings/apikey"
            className="rounded bg-gray-500 px-4 py-[13px] text-white hover:bg-gray-600 focus:bg-gray-400"
          >
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}
