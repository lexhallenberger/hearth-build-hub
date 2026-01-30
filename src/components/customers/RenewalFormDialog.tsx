import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRenewal, useUpdateRenewal, useCustomers } from '@/hooks/useCustomers';
import { Loader2 } from 'lucide-react';
import type { Renewal, RenewalStatus } from '@/types/customers';

interface RenewalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewal?: Renewal | null;
  customerId?: string;
}

export function RenewalFormDialog({ open, onOpenChange, renewal, customerId }: RenewalFormDialogProps) {
  const createRenewal = useCreateRenewal();
  const updateRenewal = useUpdateRenewal();
  const { data: customers = [] } = useCustomers();
  const isEditing = !!renewal;

  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    status: 'upcoming' as RenewalStatus,
    renewal_date: '',
    current_value: 0,
    proposed_value: 0,
    risk_level: 'low',
    notes: '',
  });

  useEffect(() => {
    if (renewal) {
      setFormData({
        customer_id: renewal.customer_id,
        status: renewal.status,
        renewal_date: renewal.renewal_date,
        current_value: renewal.current_value,
        proposed_value: renewal.proposed_value,
        risk_level: renewal.risk_level,
        notes: renewal.notes || '',
      });
    } else {
      setFormData({
        customer_id: customerId || '',
        status: 'upcoming',
        renewal_date: '',
        current_value: 0,
        proposed_value: 0,
        risk_level: 'low',
        notes: '',
      });
    }
  }, [renewal, customerId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      customer_id: formData.customer_id,
      deal_id: null,
      status: formData.status,
      renewal_date: formData.renewal_date,
      current_value: formData.current_value,
      proposed_value: formData.proposed_value,
      risk_level: formData.risk_level,
      risk_factors: null,
      notes: formData.notes || null,
    };

    if (isEditing) {
      await updateRenewal.mutateAsync({ id: renewal.id, ...payload });
    } else {
      await createRenewal.mutateAsync(payload);
    }
    
    onOpenChange(false);
  };

  const isPending = createRenewal.isPending || updateRenewal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Renewal' : 'Create Renewal'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!customerId && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="renewal_date">Renewal Date *</Label>
              <Input
                id="renewal_date"
                type="date"
                value={formData.renewal_date}
                onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: RenewalStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="renewed">Renewed</SelectItem>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Value ($)</Label>
              <Input
                id="current_value"
                type="number"
                min="0"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposed_value">Proposed Value ($)</Label>
              <Input
                id="proposed_value"
                type="number"
                min="0"
                value={formData.proposed_value}
                onChange={(e) => setFormData({ ...formData, proposed_value: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_level">Risk Level</Label>
            <Select
              value={formData.risk_level}
              onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.customer_id}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'} Renewal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
