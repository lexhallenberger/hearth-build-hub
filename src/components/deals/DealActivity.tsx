import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAddDealNote } from '@/hooks/useDeals';
import { DealNote } from '@/types/deals';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageSquare, Clock, CheckCircle, BarChart2 } from 'lucide-react';

interface DealActivityProps {
  dealId: string;
  notes: DealNote[];
}

const NOTE_TYPE_ICONS = {
  comment: MessageSquare,
  status_change: Clock,
  score_update: BarChart2,
  approval: CheckCircle,
};

const NOTE_TYPE_LABELS = {
  comment: 'Comment',
  status_change: 'Status Change',
  score_update: 'Score Update',
  approval: 'Approval',
};

export function DealActivity({ dealId, notes }: DealActivityProps) {
  const [newNote, setNewNote] = useState('');
  const addNote = useAddDealNote();

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    await addNote.mutateAsync({
      deal_id: dealId,
      note_type: 'comment',
      content: newNote.trim(),
    });

    setNewNote('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Deal history and comments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment... (Cmd/Ctrl + Enter to submit)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newNote.trim() || addNote.isPending}
              size="sm"
            >
              <Send className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            notes.map((note) => {
              const Icon = NOTE_TYPE_ICONS[note.note_type as keyof typeof NOTE_TYPE_ICONS] || MessageSquare;
              return (
                <div key={note.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {NOTE_TYPE_LABELS[note.note_type as keyof typeof NOTE_TYPE_LABELS]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
