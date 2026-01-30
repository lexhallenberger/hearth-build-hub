import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeal } from '@/hooks/useDeals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const dealFormSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(200, 'Name must be less than 200 characters'),
  customer_name: z.string().min(1, 'Customer name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  deal_value: z.coerce.number().min(0, 'Deal value must be positive'),
  discount_percent: z.coerce.number().min(0).max(100, 'Discount must be between 0-100').optional(),
  payment_terms: z.string().max(200).optional(),
  contract_length_months: z.coerce.number().min(1).max(120).optional(),
  expected_close_date: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export default function DealNew() {
  const navigate = useNavigate();
  const createDeal = useCreateDeal();

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      name: '',
      customer_name: '',
      description: '',
      deal_value: 0,
      discount_percent: 0,
      payment_terms: '',
      contract_length_months: 12,
      expected_close_date: '',
    },
  });

  const onSubmit = async (values: DealFormValues) => {
    const deal = await createDeal.mutateAsync({
      name: values.name,
      customer_name: values.customer_name,
      description: values.description || null,
      deal_value: values.deal_value,
      discount_percent: values.discount_percent || 0,
      payment_terms: values.payment_terms || null,
      contract_length_months: values.contract_length_months || 12,
      expected_close_date: values.expected_close_date || null,
    });

    navigate(`/deals/${deal.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/deals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Deal</h1>
          <p className="text-muted-foreground">Create a new deal to start scoring</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the deal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enterprise License - Q1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the deal..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_close_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Close Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>Enter the financial terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="deal_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Value ($) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Total contract value in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>Percentage discount offered</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net_30">Net 30</SelectItem>
                            <SelectItem value="net_60">Net 60</SelectItem>
                            <SelectItem value="net_90">Net 90</SelectItem>
                            <SelectItem value="annual_upfront">Annual Upfront</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contract_length_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Length (months)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/deals')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDeal.isPending} className="bg-accent hover:bg-accent/90">
              {createDeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
