import { Link } from "@remix-run/react";

export default function SettingsApiKeyIndexPage() {
  return (
    <Link to="edit" className="mt-3 font-medium text-blue-700">
      Edit
    </Link>
  );
}
