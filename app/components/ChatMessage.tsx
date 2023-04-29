import { Link } from "@remix-run/react";
import { formatRelative } from "date-fns";

export interface ChatMessageProps {
  content: string;
  author: React.ReactNode;
  dateOrContext: React.ReactNode;
  className: string;
  compact: boolean;
}

export function ChatMessage({
  content,
  author,
  dateOrContext,
  className,
  compact,
}: ChatMessageProps) {
  return (
    <div className={`rounded ${compact ? "p-3" : "p-5"} ${className}`}>
      <div className="font-bold capitalize">{author}</div>{" "}
      <div>
        <pre
          className={`${
            compact ? "mt-1" : "mt-2"
          } whitespace-pre-wrap font-sans`}
        >
          {content}
        </pre>

        <p
          className={`${
            compact ? "pt-2" : "pt-5"
          } text-right text-xs sm:text-sm`}
        >
          {dateOrContext}
        </p>
      </div>
    </div>
  );
}

export interface ContextChatMessageProps {
  authorOrRole: string;
  content: string;
  compact?: boolean;
}

export function ContextChatMessage({
  content,
  authorOrRole,
  compact = false,
}: ContextChatMessageProps) {
  return (
    <ChatMessage
      author={authorOrRole}
      content={content}
      dateOrContext={
        <span
          title="This message is part of the assistant's context"
          className="rounded bg-gray-500 px-2 py-1 text-white"
        >
          context
        </span>
      }
      className="bg-gray-200"
      compact={compact}
    />
  );
}

export interface UserChatMessageProps {
  createdAt: string;
  content: string;
  compact?: boolean;
}

export function UserChatMessage({
  content,
  createdAt,
  compact = false,
}: UserChatMessageProps) {
  return (
    <ChatMessage
      author="User"
      content={content}
      dateOrContext={formatRelative(new Date(createdAt), new Date())}
      className="bg-white"
      compact={compact}
    />
  );
}

export interface AssistantChatMessageProps {
  assistantName: string;
  assistantId: string;
  createdAt: string;
  content: string;
  compact?: boolean;
}

export function AssistantChatMessage({
  assistantName,
  assistantId,
  content,
  createdAt,
  compact = false,
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
      compact={compact}
    />
  );
}
