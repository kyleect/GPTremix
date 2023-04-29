import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import type { ChatCompletionRequestMessage } from "openai";
import { Configuration, OpenAIApi } from "openai";
import React from "react";
import invariant from "tiny-invariant";
import {
  AssistantChatMessage,
  ContextChatMessage,
  UserChatMessage,
} from "~/components/ChatMessage";
import { getAssistant } from "~/models/assistant.server";

import { addMessage, deleteChat, getChat } from "~/models/chat.server";
import { requireUser, requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.chatId, "chatId not found");

  const chat = await getChat({ userId, id: params.chatId });

  if (!chat) {
    throw new Response("Chat Not Found", { status: 404 });
  }

  const assistant = await getAssistant({ userId, id: chat?.assistant.id });

  if (!assistant) {
    throw new Response("Assistant For Not Found", { status: 404 });
  }

  return json({ chat, assistant });
}

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  invariant(user.settings?.openAiKey, "User does not have api key configured");

  invariant(params.chatId, "chatId parameter not found but required");

  const chat = await getChat({ userId: user.id, id: params.chatId });
  invariant(chat, `Chat was not found with id ${params.chatId}`);

  const formData = await request.formData();

  const intent = await formData.get("intent");

  if (intent === "delete") {
    await deleteChat({ id: chat.id, userId: user.id });

    return redirect("/chats");
  }

  const assistant = await getAssistant({
    userId: user.id,
    id: chat.assistant.id,
  });
  invariant(
    assistant,
    `Assistant was not found with id ${chat.assistant.id} for chat ${chat.id}`
  );

  const userInput = formData.get("userInput");
  if (typeof userInput !== "string" || userInput.length === 0) {
    return json(
      { errors: { userInput: "User input message is required" } },
      { status: 400 }
    );
  }

  const assistantContext = assistant.contextMessages.map(
    ({ role, content }) =>
      ({
        role,
        content,
      } as ChatCompletionRequestMessage)
  );

  const messageHistory = chat.messages.map(
    ({ role, content }) =>
      ({
        role,
        content,
      } as ChatCompletionRequestMessage)
  );

  const conf = new Configuration({
    apiKey: user.settings.openAiKey,
  });

  const openai = new OpenAIApi(conf);
  const gptChatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      ...assistantContext,
      ...messageHistory,
      {
        role: "user",
        content: userInput,
      },
    ],
  });

  const response = gptChatCompletion.data.choices[0].message;

  invariant(response?.content, "GPT response did not return valid response");

  // Persist user's latest input as a message
  await addMessage({
    chatId: chat.id,
    role: "user",
    content: userInput,
  });

  await addMessage({
    chatId: params.chatId,
    role: "assistant",
    content: response?.content,
  });

  return json({ errors: null });
}

export default function ChatDetailsPage() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const navigation = useNavigation();
  const location = useLocation();

  debugger;

  const isReady = navigation.state === "idle";

  React.useEffect(() => {
    if (actionData?.errors?.userInput) {
      inputRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      <ol>
        {data.assistant.contextMessages.map((message) => (
          <li
            key={message.id}
            id={message.id}
            className="group mt-5 first:mt-0"
          >
            <ContextChatMessage
              authorOrRole={message.role}
              content={message.content}
            />
          </li>
        ))}
      </ol>

      <hr className="my-10" />

      <ol>
        {data.chat.messages.map((message, i) => (
          <li
            key={message.id}
            id={`message-${message.id}`}
            className="group mt-5 rounded border border-transparent first:mt-0 hover:border-slate-600 hover:bg-slate-200"
          >
            {message.role === "user" ? (
              <UserChatMessage
                content={message.content}
                createdAt={message.createdAt}
              />
            ) : (
              <AssistantChatMessage
                content={message.content}
                createdAt={message.createdAt}
                assistantId={data.assistant.id}
                assistantName={data.assistant.name}
              />
            )}

            <ol className="invisible flex w-full justify-end space-x-3 group-hover:visible">
              <li className="text-sm text-blue-700 hover:font-bold">
                <Link
                  className="inline-block p-2"
                  to={`#message-${message.id}`}
                >
                  Link
                </Link>
              </li>

              {i > 0 && (
                <li className="text-sm text-blue-700 hover:font-bold">
                  <Link
                    className="inline-block p-2"
                    to={`#message-${data.chat.messages[i - 1].id}`}
                  >
                    Previous
                  </Link>
                </li>
              )}

              {i + 1 < data.chat.messages.length && (
                <li className="text-sm text-blue-700 hover:font-bold">
                  <Link
                    className="inline-block p-2"
                    to={`#message-${data.chat.messages[i + 1].id}`}
                  >
                    Next
                  </Link>
                </li>
              )}
            </ol>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <div>
          <label className="flex w-full flex-col gap-1">
            <textarea
              disabled={!isReady}
              ref={inputRef}
              name="userInput"
              rows={8}
              key={data.chat.messages.length.toString()}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-6 disabled:border-gray-400"
              aria-invalid={actionData?.errors?.userInput ? true : undefined}
              aria-errormessage={
                actionData?.errors?.userInput ? "user-input-error" : undefined
              }
              form="submit-form"
            />
          </label>
          {actionData?.errors?.userInput && (
            <div className="pt-1 text-red-700" id="user-input-error">
              {actionData.errors.userInput}
            </div>
          )}
        </div>

        <div className="flex justify-between py-5">
          <button
            type="submit"
            className="rounded bg-blue-500  px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-gray-400"
            disabled={!isReady}
            form="submit-form"
          >
            {isReady ? "Send" : "Sending..."}
          </button>

          <button
            form="delete-form"
            name="intent"
            value="delete"
            className="rounded bg-gray-400 px-4 py-2  text-white hover:bg-gray-500"
          >
            Delete
          </button>
        </div>
      </div>

      <Form
        action={`${location.pathname}`}
        method="post"
        replace
        className="mt-4"
        id="submit-form"
      />

      <Form
        action={`${location.pathname}`}
        method="post"
        className="mt-5"
        onSubmit={(event) => {
          if (!confirm("Are you sure you want to delete this chat?")) {
            event.preventDefault();
          }
        }}
        id="delete-form"
      />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Chat not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
