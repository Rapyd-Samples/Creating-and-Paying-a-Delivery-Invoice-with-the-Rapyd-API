import { CustomerDashboard } from "@/components/customer-dashboard";
import { SignOutButton } from "@/components/sign-out";
import { Card, CardContent } from "@/components/ui/card";
import { VendorDashboard } from "@/components/vendor-dashboard";
import { getUser } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div className="flex justify-center items-center flex-1">
      <SignOutButton />
      <Card className="max-w-2xl w-full">
        <CardContent>
          {user.type === "vendor" ? (
            <VendorDashboard user={user} />
          ) : (
            <CustomerDashboard user={user} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
