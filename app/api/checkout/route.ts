import {
  getUser,
  loadDb,
  getInvoicesCollection,
  getUsersCollection,
} from "@/lib/server-utils";
import { ObjectId } from "mongodb";
import { makeRequest } from "@/lib/make-request";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await getUser();
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoice");
  const db = await loadDb();
  const invoicesCollection = getInvoicesCollection(db);
  const usersCollection = getUsersCollection(db);
  const invoice = await invoicesCollection.findOne({
    _id: new ObjectId(invoiceId!),
  });

  if (!invoice) {
    return new Response("Invoice not found", { status: 404 });
  }

  const customer = await usersCollection.findOne({
    _id: new ObjectId(user?.id),
    type: "customer",
  });

  if (!customer) {
    return new Response("Unauthorized", { status: 401 });
  }

  const vendor = await usersCollection.findOne({
    _id: new ObjectId(invoice.vendorId),
    type: "vendor",
  });

  if (!vendor) {
    return new Response("Vendor not found", { status: 404 });
  }

  const response = await makeRequest("POST", "/v1/checkout", {
    cart_items: invoice.items.map((item) => ({
      name: item.description,
      quantity: item.quantity,
      amount: item.amount,
    })),
    complete_payment_url: `${
      process.env.NEXTAUTH_URL || ""
    }/api/checkout/complete?invoice=${invoice._id}`,
    currency: "USD",
    country: "US",
    customer: customer.customerId,
    ewallet: vendor.walletId,
    error_payment_url: process.env.NEXTAUTH_URL || "",
    merchant_reference_id: invoice.code,
    metadata: {
      invoiceId: `${invoice._id}`,
    },
  });

  await invoicesCollection.updateOne(
    { _id: new ObjectId(invoiceId!) },
    {
      $set: {
        checkoutId: response.data.id,
      },
    }
  );

  return redirect(response.data.redirect_url);
}
