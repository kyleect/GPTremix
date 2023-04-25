import { Link } from "@remix-run/react";
import { formatRelative } from "date-fns";

export interface ChatMessageProps {
  content: string;
  author: React.ReactNode;
  dateOrContext: React.ReactNode;
  className: string;
}

export function ChatMessage({
  content,
  author,
  dateOrContext,
  className,
}: ChatMessageProps) {
  return (
    <div className={`mb-4 rounded-md border border-gray-300 p-5 ${className}`}>
      <div className="font-bold capitalize">{author}</div>{" "}
      <div>
        <pre className="mt-2 whitespace-pre-wrap font-sans">{content}</pre>

        <p className="pt-5 text-right text-xs sm:text-sm">{dateOrContext}</p>
      </div>
    </div>
  );
}

export interface ContextChatMessageProps {
  authorOrRole: string;
  content: string;
}

export function ContextChatMessage({
  content,
  authorOrRole,
}: ContextChatMessageProps) {
  return (
    <ChatMessage
      author={authorOrRole}
      content={content}
      dateOrContext={
        <span
          title="This message is part of the assistant's context"
          className="rounded-md bg-gray-500 px-2 py-1 text-white"
        >
          context
        </span>
      }
      className="bg-gray-200"
    />
  );
}

export interface UserChatMessageProps {
  createdAt: string;
  content: string;
}

export function UserChatMessage({ content, createdAt }: UserChatMessageProps) {
  return (
    <ChatMessage
      author="User"
      content={content}
      dateOrContext={formatRelative(new Date(createdAt), new Date())}
      className="bg-white"
    />
  );
}

export interface AssistantChatMessageProps {
  assistantName: string;
  assistantId: string;
  createdAt: string;
  content: string;
}

export function AssistantChatMessage({
  assistantName,
  assistantId,
  content,
  createdAt,
}: AssistantChatMessageProps) {
  return (
    <ChatMessage
      author={
        <Link to={`/assistants/${assistantId}`} className="text-blue-700">
          {assistantName}
        </Link>
      }
      content={content}
      dateOrContext={formatRelative(new Date(createdAt), new Date())}
      className="bg-gray-100"
    />
  );
}
