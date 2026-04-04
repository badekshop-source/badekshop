'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OrderActions({ orderId, currentOrderStatus, orderTotal }: { orderId: string; currentOrderStatus: string; orderTotal: number }) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState(currentOrderStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  const handleUpdate = async () => {
    if (newStatus === currentOrderStatus) return;
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update order status');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) return;
    setIsRefunding(true);

    try {
      const adminFee = Math.round(orderTotal * 0.05);
      const refundAmount = orderTotal - adminFee;

      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason, refundAmount, adminFee }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to process refund');
      }

      setRefundOpen(false);
      setRefundReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  const canUpdate = !['completed', 'cancelled', 'expired'].includes(currentOrderStatus);
  const canRefund = ['paid', 'processing', 'approved'].includes(currentOrderStatus);

  if (!canUpdate && !canRefund) return null;

  const adminFee = Math.round(orderTotal * 0.05);
  const refundAmount = orderTotal - adminFee;

  return (
    <>
      {canUpdate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Update Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? currentOrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            <Button onClick={handleUpdate} disabled={isUpdating || newStatus === currentOrderStatus} className="w-full">
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {canRefund && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Process Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Total</span>
                <span>Rp {orderTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Admin Fee (5%)</span>
                <span>- Rp {adminFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                <span>Refund Amount</span>
                <span className="text-green-600">Rp {refundAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <Button onClick={() => setRefundOpen(true)} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
              Process Refund
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              This will refund Rp {refundAmount.toLocaleString('id-ID')} to the customer (5% admin fee deducted).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Reason</label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)} disabled={isRefunding}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isRefunding || !refundReason.trim()} className="bg-red-600 hover:bg-red-700">
              {isRefunding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Refund Rp ${refundAmount.toLocaleString('id-ID')}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
