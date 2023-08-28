"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export function AuthForm() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [userType, setUserType] = React.useState<string>("customer");
  const router = useRouter();

  const submit = async () => {
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      type: userType,
    });

    if (result?.ok) {
      router.replace("/");
    }

    setLoading(false);
  };

  return (
    <div className="grid gap-2">
      <div className="grid gap-1">
        <Label className="sr-only" htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          disabled={loading}
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <Input
          id="password"
          placeholder="password"
          type="password"
          autoComplete="current-password"
          disabled={loading}
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <Select value={userType} onValueChange={(value) => setUserType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="vendor">Vendor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button disabled={loading} onClick={submit}>
        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </div>
  );
}
