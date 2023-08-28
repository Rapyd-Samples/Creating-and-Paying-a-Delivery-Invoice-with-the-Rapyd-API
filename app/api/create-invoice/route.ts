import {
  getInvoicesCollection,
  getUser,
  getUsersCollection,
  loadDb,
} from "@/lib/server-utils";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const user = await getUser();
  const { email, invoiceItems, invoiceCode, total } = await request.json();
  const db = await loadDb();
  const usersCollection = getUsersCollection(db);
  const invoiceCollection = getInvoicesCollection(db);
  const customer = await usersCollection.findOne({
    email: email,
    type: "customer",
  });

  if (!user || user.type !== "vendor") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!customer) {
    return new Response("Customer not found", { status: 404 });
  }

  const invoice = await invoiceCollection.insertOne({
    _id: new ObjectId(),
    vendorId: new ObjectId(user.id),
    customerId: customer._id,
    items: invoiceItems,
    code: invoiceCode,
    status: "pending",
    total,
  });

  return new Response(JSON.stringify({ invoiceId: invoice.insertedId }), {
    status: 200,
  });
}
