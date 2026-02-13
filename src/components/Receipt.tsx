import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ReceiptProps {
  receiptNumber: string;
  items: any[];
  total: string;
  method: string;
}

export const Receipt = ({ receiptNumber, items, total, method }: ReceiptProps) => (
  <Card className="w-full max-w-md mx-auto my-4 border-dashed">
    <CardHeader className="text-center">
      <CardTitle className="text-xl tracking-widest uppercase">Official Receipt</CardTitle>
      <p className="text-sm text-muted-foreground">#{receiptNumber}</p>
    </CardHeader>
    <CardContent className="space-y-3">
      <Separator />
      {items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{item.title} (x{item.quantity})</span>
          <span>{item.paymentMethod === 'tokens' ? `${item.tokenValue} T` : `KSH ${item.price * 130}`}</span>
        </div>
      ))}
      <Separator />
      <div className="flex justify-between font-bold">
        <span>Total Paid</span>
        <span>{total}</span>
      </div>
      <p className="pt-4 text-xs text-center italic">Thank you for using BookSwap via {method}!</p>
    </CardContent>
  </Card>
);