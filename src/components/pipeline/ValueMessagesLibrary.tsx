import { useState } from 'react';
import { useValueMessages, useDeleteValueMessage, useUpdateValueMessage } from '@/hooks/usePipeline';
import { ValueMessage } from '@/types/pipeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MoreHorizontal, Trash2, Copy, TrendingUp, MessageSquare, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ValueMessageFormDialog } from './ValueMessageFormDialog';

const CATEGORIES = ['All', 'Product', 'Service', 'Support', 'ROI', 'Competitive'];

export function ValueMessagesLibrary() {
  const { data: messages, isLoading } = useValueMessages();
  const deleteMessage = useDeleteValueMessage();
  const updateMessage = useUpdateValueMessage();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ValueMessage | null>(null);

  const filteredMessages = messages?.filter((msg) => {
    const matchesSearch =
      msg.title.toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || msg.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleCopyMessage = (message: ValueMessage) => {
    navigator.clipboard.writeText(message.message);
    // Increment usage count
    updateMessage.mutate({ id: message.id, usage_count: (message.usage_count || 0) + 1 });
    toast({ title: 'Message copied to clipboard' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading value messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search value messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Message
        </Button>
      </div>

      {filteredMessages && filteredMessages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMessages.map((msg) => (
            <Card key={msg.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{msg.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {msg.category && (
                        <Badge variant="secondary" className="text-xs">
                          {msg.category}
                        </Badge>
                      )}
                      {msg.target_persona && (
                        <Badge variant="outline" className="text-xs">
                          {msg.target_persona}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopyMessage(msg)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingMessage(msg)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMessage.mutate(msg.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 mb-4">{msg.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {msg.usage_count || 0} uses
                    </div>
                    {msg.win_rate !== null && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {msg.win_rate}% win rate
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => handleCopyMessage(msg)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p>No value messages found</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>
              Create your first value message
            </Button>
          </CardContent>
        </Card>
      )}

      <ValueMessageFormDialog
        open={isCreateOpen || !!editingMessage}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingMessage(null);
          }
        }}
        editingMessage={editingMessage}
      />
    </div>
  );
}
