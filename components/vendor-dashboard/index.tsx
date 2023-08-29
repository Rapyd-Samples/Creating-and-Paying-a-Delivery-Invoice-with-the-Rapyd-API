import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { getInvoicesCollection, loadDb } from "@/lib/server-utils";
import { User } from "next-auth";
import { ObjectId } from "mongodb";
import { Badge } from "../ui/badge";

export async function VendorDashboard(props: { user: User }) {
  const db = await loadDb();
  const invoicesCollection = getInvoicesCollection(db);
  const currencyFormatter = new Intl.NumberFormat("us-US", {
    style: "currency",
    currency: "USD",
  });
  const invoices = await invoicesCollection
    .find({ vendorId: new ObjectId(props.user.id) })
    .sort({ _id: -1 })
    .toArray();

  return (
    <Table>
      <TableCaption>
        <CreateInvoiceDialog />
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={`${invoice._id}`}>
            <TableCell className="font-medium">{invoice.code}</TableCell>
            <TableCell>{currencyFormatter.format(invoice.total)}</TableCell>
            <TableCell className="text-right">
              <Badge
                variant={invoice.status === "paid" ? "secondary" : "default"}
              >
                {invoice.status !== "paid" ? "Pending" : "Paid"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
