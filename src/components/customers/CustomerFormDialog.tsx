import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { Loader2 } from 'lucide-react';
import type { Customer, CustomerTier, HealthStatus } from '@/types/customers';

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEditing = !!customer;

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    tier: 'smb' as CustomerTier,
    contract_start_date: '',
    contract_end_date: '',
    mrr: 0,
    health_score: 50,
    health_status: 'healthy' as HealthStatus,
    primary_contact_name: '',
    primary_contact_email: '',
    notes: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        industry: customer.industry || '',
        tier: customer.tier,
        contract_start_date: customer.contract_start_date || '',
        contract_end_date: customer.contract_end_date || '',
        mrr: customer.mrr,
        health_score: customer.health_score,
        health_status: customer.health_status,
        primary_contact_name: customer.primary_contact_name || '',
        primary_contact_email: customer.primary_contact_email || '',
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        tier: 'smb',
        contract_start_date: '',
        contract_end_date: '',
        mrr: 0,
        health_score: 50,
        health_status: 'healthy',
        primary_contact_name: '',
        primary_contact_email: '',
        notes: '',
      });
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      industry: formData.industry || null,
      tier: formData.tier,
      contract_start_date: formData.contract_start_date || null,
      contract_end_date: formData.contract_end_date || null,
      mrr: formData.mrr,
      health_score: formData.health_score,
      health_status: formData.health_status,
      primary_contact_name: formData.primary_contact_name || null,
      primary_contact_email: formData.primary_contact_email || null,
      logo_url: null,
      notes: formData.notes || null,
    };

    if (isEditing) {
      await updateCustomer.mutateAsync({ id: customer.id, ...payload });
    } else {
      await createCustomer.mutateAsync(payload);
    }
    
    onOpenChange(false);
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(value: CustomerTier) => setFormData({ ...formData, tier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="mid_market">Mid-Market</SelectItem>
                  <SelectItem value="smb">SMB</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mrr">MRR ($)</Label>
              <Input
                id="mrr"
                type="number"
                min="0"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_start_date">Contract Start</Label>
              <Input
                id="contract_start_date"
                type="date"
                value={formData.contract_start_date}
                onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract_end_date">Contract End</Label>
              <Input
                id="contract_end_date"
                type="date"
                value={formData.contract_end_date}
                onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_contact_name">Primary Contact</Label>
              <Input
                id="primary_contact_name"
                value={formData.primary_contact_name}
                onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary_contact_email">Contact Email</Label>
              <Input
                id="primary_contact_email"
                type="email"
                value={formData.primary_contact_email}
                onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
              />
            </div>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'} Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
