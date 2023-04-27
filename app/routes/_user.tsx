import { Outlet } from "@remix-run/react";
import LoggedInHeader from "~/components/LoggedInHeader";

export default function UserRouteLayout() {
  return (
    <>
      <LoggedInHeader />

      <Outlet />
    </>
  );
}
