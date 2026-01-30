import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateValueMessage, useUpdateValueMessage } from '@/hooks/usePipeline';
import { ValueMessage } from '@/types/pipeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['Product', 'Service', 'Support', 'ROI', 'Competitive'];
const PERSONAS = ['C-Suite', 'VP/Director', 'Manager', 'End User', 'Technical', 'Finance'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Other'];

const messageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  category: z.string().optional(),
  target_persona: z.string().optional(),
  target_industry: z.string().optional(),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ValueMessageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMessage?: ValueMessage | null;
}

export function ValueMessageFormDialog({
  open,
  onOpenChange,
  editingMessage,
}: ValueMessageFormDialogProps) {
  const createMessage = useCreateValueMessage();
  const updateMessage = useUpdateValueMessage();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: '',
      message: '',
      category: '',
      target_persona: '',
      target_industry: '',
    },
  });

  useEffect(() => {
    if (editingMessage) {
      form.reset({
        title: editingMessage.title,
        message: editingMessage.message,
        category: editingMessage.category || '',
        target_persona: editingMessage.target_persona || '',
        target_industry: editingMessage.target_industry || '',
      });
    } else {
      form.reset({
        title: '',
        message: '',
        category: '',
        target_persona: '',
        target_industry: '',
      });
    }
  }, [editingMessage, form]);

  const onSubmit = async (values: MessageFormValues) => {
    if (editingMessage) {
      await updateMessage.mutateAsync({
        id: editingMessage.id,
        title: values.title,
        message: values.message,
        category: values.category || null,
        target_persona: values.target_persona || null,
        target_industry: values.target_industry || null,
      });
    } else {
      await createMessage.mutateAsync({
        title: values.title,
        message: values.message,
        category: values.category || null,
        target_persona: values.target_persona || null,
        target_industry: values.target_industry || null,
      });
    }
    form.reset();
    onOpenChange(false);
  };

  const isPending = createMessage.isPending || updateMessage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingMessage ? 'Edit Value Message' : 'Create Value Message'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cost Savings Focus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="The value proposition message..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_persona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Persona</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PERSONAS.map((persona) => (
                          <SelectItem key={persona} value={persona}>
                            {persona}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : editingMessage ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
