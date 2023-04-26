import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export default function AssistantIndexPage() {
  return (
    <p className="text-sm sm:text-base">
      No assistant selected. Select an assistant on the left,{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new assistant
      </Link>
      , or{" "}
      <Link to="import" className="text-blue-500 underline">
        import one.
      </Link>
    </p>
  );
}
