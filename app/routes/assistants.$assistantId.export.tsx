import React from "react";
import invariant from "tiny-invariant";
import { useMatchesData } from "~/utils";
import type { loader as parentLoader } from "~/routes/assistants.$assistantId";

export default function AssistantDetailsExportPage() {
    const data = useMatchesData<typeof parentLoader>("routes/assistants.$assistantId");

    invariant(data, "Unable to load assistant data from parent route");

    const assistantExport = JSON.stringify({
        name: data.assistant.name,
        messages: data.assistant.contextMessages.map(({ role, content }) => ({ role, content }))
    });

    const copy = React.useCallback(() => {
        navigator.clipboard.writeText(assistantExport);
    }, [assistantExport]);

    return (
        <>
            <div className="flex justify-between">
                <button
                    type="button"
                    className="grow-1 rounded bg-gray-400 px-4 py-2 font-medium text-white hover:bg-gray-500"
                    onClick={copy}>
                    Copy
                </button>
                <pre className="grow bg-gray-100 p-2 truncate ...">
                    {assistantExport}
                </pre>
            </div>
        </>
    );
}