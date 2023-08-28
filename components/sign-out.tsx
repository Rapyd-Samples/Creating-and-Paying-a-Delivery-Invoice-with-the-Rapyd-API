"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function SignOutButton() {
  return (
    <Button
      onClick={() => {
        signOut();
      }}
      variant="ghost"
      className="fixed top-4 right-4"
    >
      Sign Out
    </Button>
  );
}
