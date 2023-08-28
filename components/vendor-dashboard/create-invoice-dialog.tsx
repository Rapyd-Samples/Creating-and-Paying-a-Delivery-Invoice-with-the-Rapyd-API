"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { InvoiceItem, InvoiceItemsTable } from "./invoice-items-table";

const createInvoiceItem = () => {
  return {
    id: nanoid(),
    description: "",
    amount: 0,
    quantity: 1,
  };
};
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("us-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
export function CreateInvoiceDialog() {
  const [email, setEmail] = useState("");
  const [invoiceCode, setInvoiceCode] = useState("");
  const [step, setStep] = useState<"items" | "send">("items");
  const [dialogOpened, setDialogOpened] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    createInvoiceItem(),
  ]);
  const router = useRouter();
  const total = useMemo(() => {
    return invoiceItems.reduce(
      (total, item) => total + item.amount * item.quantity,
      0
    );
  }, [invoiceItems]);

  useEffect(() => {
    if (dialogOpened) {
      setInvoiceItems([createInvoiceItem()]);
      setEmail("");
      setStep("items");
    }
  }, [dialogOpened]);

  return (
    <Dialog open={dialogOpened} onOpenChange={(open) => setDialogOpened(open)}>
      <DialogTrigger asChild>
        <Button size="sm">Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl gap-0">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>
            Add items to your invoice and send it to your customer.
          </DialogDescription>
        </DialogHeader>
        {step === "items" ? (
          <InvoiceItemsTable
            invoiceItems={invoiceItems}
            setInvoiceItems={setInvoiceItems}
          />
        ) : (
          <div className="my-2 gap-2 flex flex-col">
            <Input
              type="text"
              placeholder="Invoice Code"
              value={invoiceCode}
              onChange={(event) => {
                setInvoiceCode(event.target.value);
              }}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </div>
        )}
        <div className="flex w-full items-center gap-2 border-t pt-2 px-1">
          <span className="flex-1 font-medium">
            Total: {formatCurrency(total)}
          </span>
          {step === "items" ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInvoiceItems([...invoiceItems, createInvoiceItem()]);
                }}
              >
                Add Item
              </Button>
              <Button
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  setStep("send");
                }}
              >
                <ChevronRight />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9"
                onClick={() => {
                  setStep("items");
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await fetch("/api/create-invoice", {
                      method: "POST",
                      body: JSON.stringify({
                        email,
                        invoiceCode,
                        invoiceItems,
                        total,
                      }),
                    });
                    setDialogOpened(false);
                    router.refresh();
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                Send
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
