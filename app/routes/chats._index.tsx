import { Link } from "@remix-run/react";

export default function ChatIndexPage() {
  return (
    <p>
      No chat selected. Select a chat on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new chat.
      </Link>
    </p>
  );
}
