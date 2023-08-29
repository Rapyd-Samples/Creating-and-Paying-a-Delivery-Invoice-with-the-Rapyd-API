"use client";

import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export function InvoiceItemsTable({
  invoiceItems,
  setInvoiceItems,
}: {
  invoiceItems: InvoiceItem[];
  setInvoiceItems: (items: InvoiceItem[]) => void;
}) {
  const setInvoiceItem = (id: string, newItem: InvoiceItem) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          return newItem;
        }
        return item;
      })
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Item</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoiceItems.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium py-2 px-1">
                <Input
                  className="h-9"
                  value={item.description}
                  onChange={(event) => {
                    setInvoiceItem(item.id, {
                      ...item,
                      description: event.target.value,
                    });
                  }}
                />
              </TableCell>
              <TableCell className="font-medium py-2 px-1">
                <Input
                  className="h-9"
                  type="number"
                  value={item.amount}
                  onChange={(event) => {
                    setInvoiceItem(item.id, {
                      ...item,
                      amount: Number(event.target.value),
                    });
                  }}
                />
              </TableCell>
              <TableCell className="font-medium py-2 px-1">
                <Input
                  className="h-9"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => {
                    setInvoiceItem(item.id, {
                      ...item,
                      quantity: Number(event.target.value) || 1,
                    });
                  }}
                />
              </TableCell>
              <TableCell className="font-medium py-2 px-1">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-9 w-9"
                  disabled={invoiceItems.length === 1}
                  onClick={() => {
                    setInvoiceItems(
                      invoiceItems.filter(
                        (filteredItem) => filteredItem.id !== item.id
                      )
                    );
                  }}
                >
                  <X />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
