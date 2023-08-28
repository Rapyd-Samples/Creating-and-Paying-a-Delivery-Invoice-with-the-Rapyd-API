import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { getInvoicesCollection, loadDb } from "@/lib/server-utils";
import { ObjectId } from "mongodb";
import { User } from "next-auth";
import Link from "next/link";
import { Badge, badgeVariants } from "./ui/badge";

export async function CustomerDashboard(props: { user: User }) {
  const db = await loadDb();
  const invoicesCollection = getInvoicesCollection(db);
  const currencyFormatter = new Intl.NumberFormat("us-US", {
    style: "currency",
    currency: "USD",
  });
  const invoices = await invoicesCollection
    .find({ customerId: new ObjectId(props.user.id) })
    .sort({ _id: -1 })
    .toArray();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow key={`${invoice._id}`}>
            <TableCell className="font-medium">
              INV{`${index + 1}`.padStart(3, "0")}
            </TableCell>
            <TableCell>{currencyFormatter.format(invoice.total)}</TableCell>
            <TableCell className="text-right">
              {invoice.status !== "paid" ? (
                <Link
                  href={`/api/checkout?invoice=${encodeURIComponent(
                    `${invoice._id}`
                  )}`}
                  className={badgeVariants()}
                >
                  Pay
                </Link>
              ) : (
                <Badge variant="secondary">Paid</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
