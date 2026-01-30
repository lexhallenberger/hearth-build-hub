import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Loader2, User, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DealAdvisorChatProps {
  dealId: string;
  dealName: string;
}

const suggestedQuestions = [
  "What's the best negotiation strategy?",
  "How can I improve the deal score?",
  "What risks should I address first?",
  "Compare to similar won deals",
];

export function DealAdvisorChat({ dealId, dealName }: DealAdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-deal-coach', {
        body: { 
          dealId, 
          action: 'chat',
          message: messageText.trim()
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.analysis || "I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get response. Please try again.');
      
      // Remove the user message if we couldn't get a response
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-accent" />
            Deal Advisor Chat
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Ask questions about {dealName}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-medium mb-2">Ask me anything about this deal</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">
                I can help with negotiation strategy, risk analysis, and recommendations
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[85%]',
                      message.role === 'user'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this deal..."
              className="min-h-[44px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
