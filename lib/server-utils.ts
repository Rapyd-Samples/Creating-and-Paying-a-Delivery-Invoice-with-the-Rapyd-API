import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Db, MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

export async function loadDb() {
  const client = new MongoClient(process.env.MONGODB_URI || "");

  await client.connect();

  return client.db();
}
export function getUsersCollection(db: Db) {
  return db.collection<{
    _id: ObjectId;
    email: string;
    type: string;
    password: string;
    customerId?: string;
    walletId?: string;
  }>("users");
}
export function getInvoicesCollection(db: Db) {
  return db.collection<{
    _id: ObjectId;
    code: string;
    vendorId: ObjectId;
    customerId: ObjectId;
    checkoutId?: string;
    items: {
      description: string;
      quantity: number;
      amount: number;
    }[];
    status: string;
    total: number;
  }>("invoices");
}
export async function getUser() {
  const session = await getServerSession(authOptions);

  return session?.user;
}
