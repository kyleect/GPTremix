import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  return json({ user });
}

export default function SettingsProfilePage() {
  const data = useLoaderData<typeof loader>();

  const truncatedApiKey = data.user.settings?.openAiKey?.substring(0, 10);

  return (
    <div>
      <p className="font-bold">Current OpenAI API Key</p>
      <p>{truncatedApiKey}...</p>

      <Outlet />
    </div>
  );
}
