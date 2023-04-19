import { Link } from "@remix-run/react";

export default function AssistantIndexPage() {
    return (
        <p>
            No assistant selected. Select an assistant on the left, or{" "}
            <Link to="new" className="text-blue-500 underline">
                create a new assistant.
            </Link>
        </p>
    );
}
