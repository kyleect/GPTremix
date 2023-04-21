import { Form, Link, NavLink } from "@remix-run/react";
import React from "react";

export default function LoggedInHeader() {
    return (
        <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
            <h1 className="text-2xl font-bold">
                <Link to="/">GPTremix</Link>
            </h1>
            <ul className="flex w-full justify-around">
                <li><HeaderNavLink to="/chats">Chats</HeaderNavLink></li>
                <li><HeaderNavLink to="/assistants">Assistants</HeaderNavLink></li>
            </ul>
            <LogoutButton />
        </header>
    )
}

function LogoutButton() {
    return (
        <Form action="/logout" method="post">
            <button
                type="submit"
                className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
                Logout
            </button>
        </Form>
    );
}

type HeaderNavLinkProps = {
    to: string,
    children: React.ReactNode
}

function HeaderNavLink({ to, children }: HeaderNavLinkProps) {
    return (
        <NavLink to={to} className={({ isActive }) =>
            `text-base text-white mt-3 ${isActive ? 'font-bold' : ""}`}>
            {children}
        </NavLink>
    );
}