import { Link } from "@remix-run/react";
import { formatRelative } from "date-fns";

export interface ChatMessageProps {
    content: string;
    author: React.ReactNode;
    dateOrContext: React.ReactNode;
    className: string;
}

export function ChatMessage({ content, author, dateOrContext, className }: ChatMessageProps) {
    return (
        <div className={`p-5 border mb-4 border-gray-300 rounded-md ${className}`}>
            <div className="font-bold capitalize">
                {author}
            </div>{" "}
            <div>
                <pre className="whitespace-pre-wrap font-sans mt-2">
                    {content}
                </pre>

                <p className="text-right text-xs sm:text-sm pt-5">{dateOrContext}</p>
            </div>
        </div>
    );
}

export interface ContextChatMessageProps {
    authorOrRole: string;
    content: string;
}

export function ContextChatMessage({ content, authorOrRole }: ContextChatMessageProps) {
    return (
        <ChatMessage
            author={authorOrRole}
            content={content}
            dateOrContext={
                <span title="This message is part of the assistant's context" className="rounded-md bg-gray-500 text-white py-1 px-2">
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

export function AssistantChatMessage({ assistantName, assistantId, content, createdAt }: AssistantChatMessageProps) {
    return (
        <ChatMessage
            author={
                <Link
                    to={`/assistants/${assistantId}`}
                    className="text-blue-700">
                    {assistantName}
                </Link>}
            content={content}
            dateOrContext={formatRelative(new Date(createdAt), new Date())}
            className="bg-gray-100"
        />
    );
}