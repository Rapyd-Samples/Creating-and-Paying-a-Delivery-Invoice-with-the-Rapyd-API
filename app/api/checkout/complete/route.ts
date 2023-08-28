import { getInvoicesCollection, loadDb } from "@/lib/server-utils";
import { ObjectId } from "mongodb";
import { makeRequest } from "@/lib/make-request";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoice");
  const db = await loadDb();
  const invoicesCollection = getInvoicesCollection(db);
  const invoice = await invoicesCollection.findOne({
    _id: new ObjectId(invoiceId!),
  });

  if (!invoice) {
    return new Response("Invoice not found", { status: 404 });
  }

  const response = await makeRequest(
    "GET",
    `/v1/checkout/${invoice.checkoutId}`
  );

  if (response.data.status === "DON") {
    await invoicesCollection.updateOne(
      { _id: new ObjectId(invoiceId!) },
      {
        $set: {
          status: "paid",
        },
        $unset: {
          checkoutId: 1,
        },
      }
    );
  }

  return redirect("/");
}
