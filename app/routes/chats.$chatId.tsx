import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { formatRelative } from "date-fns";
import type { ChatCompletionRequestMessage } from "openai";
import { Configuration, OpenAIApi } from "openai";
import React from "react";
import invariant from "tiny-invariant";
import { getAssistant } from "~/models/assistant.server";

import { addMessage, getChat } from "~/models/chat.server";
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

  const assistant = await getAssistant({ userId: user.id, id: chat.assistant.id });
  invariant(assistant, `Assistant was not found with id ${chat.assistant.id} for chat ${chat.id}`);

  const formData = await request.formData();

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
      {
        role: "system",
        content: chat.assistant.prompt,
      },
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
    content: userInput
  });

  await addMessage({
    chatId: params.chatId,
    role: "assistant",
    content: response?.content
  });

  return json({ errors: null });
}

export default function ChatDetailsPage() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const navigation = useNavigation();

  const isReady = navigation.state === "idle";

  React.useEffect(() => {
    if (actionData?.errors?.userInput) {
      inputRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      {data.chat.messages.length > 0 && (
        <ol>
          <li className={`p-5 border mb-4 border-gray-500 rounded-md bg-gray-300`}>
            <div className="font-bold capitalize">
              system
            </div>{" "}
            <div>
              <pre className="whitespace-pre-wrap font-sans mt-2">
                {data.chat.assistant.prompt}
              </pre>

              <p className="text-right text-xs sm:text-sm pt-5" title="This message is part of the assistant's context">Context</p>
            </div>
          </li>
          {data.assistant.contextMessages.map(message => {
            return (
              <li key={message.id} className={`p-5 border mb-4 border-gray-500 rounded-md ${message.role === "user" ? "bg-gray-200" : "bg-gray-300"}`}>
                <div className="font-bold capitalize">
                  {message.role === "assistant" ? <Link to={`/assistants/${data.chat.assistant.id}`} className="text-blue-700">{data.chat.assistant.name}</Link> : message.role}
                </div>{" "}
                <div>
                  <pre className="whitespace-pre-wrap font-sans mt-2">
                    {message.content}
                  </pre>

                  <p className="text-right text-xs sm:text-sm pt-5" title="This message is part of the assistant's context">Context</p>
                </div>
              </li>
            );
          })}
          {data.chat.messages.map((message) => {
            return (
              <li key={message.id} className={`p-5 border mb-4 border-gray-300 rounded-md ${message.role === "user" ? "bg-white" : "bg-gray-100"}`}>
                <div className="font-bold capitalize">
                  {message.role === "assistant" ? <Link to={`/assistants/${data.chat.assistant.id}`} className="text-blue-700">{data.chat.assistant.name}</Link> : message.role}
                </div>{" "}
                <div>
                  <pre className="whitespace-pre-wrap font-sans mt-2">
                    {message.content}
                  </pre>

                  <p className="text-right text-xs sm:text-sm pt-5">{formatRelative(new Date(message.createdAt), new Date())}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Form method="post" replace className="mt-4">
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
              autoFocus
            />
          </label>
          {actionData?.errors?.userInput && (
            <div className="pt-1 text-red-700" id="user-input-error">
              {actionData.errors.userInput}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="my-5 rounded bg-blue-500  px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-gray-400"
          disabled={!isReady}
        >
          {isReady ? "Send" : "Sending..."}
        </button>
      </Form>
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
