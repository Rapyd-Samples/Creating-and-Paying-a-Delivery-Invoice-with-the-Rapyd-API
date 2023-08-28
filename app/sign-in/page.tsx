import { AuthForm } from "@/components/auth-form";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/server-utils";

export default async function SignInPage() {
  const user = await getUser();

  if (user) {
    redirect("/");
  }
  return (
    <>
      <div className="container relative hidden flex-1 flex-col items-center justify-center md:grid lg:max-w-none lg:px-0">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                The Invoicing App
              </h1>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    </>
  );
}
