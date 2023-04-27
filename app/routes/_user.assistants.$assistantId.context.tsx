import { Outlet } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export default function AssistantDetailsContextPage() {
  return (
    <>
      <Outlet />
    </>
  );
}
