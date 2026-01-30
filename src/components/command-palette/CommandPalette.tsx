import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  LayoutDashboard, 
  Handshake, 
  Map, 
  Users, 
  BarChart3, 
  Settings, 
  Target,
  GitPullRequest,
  DollarSign,
  Plus,
  Search,
  Sparkles,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { useCustomers } from '@/hooks/useCustomers';
import { useJourneys } from '@/hooks/useJourneys';
import { Badge } from '@/components/ui/badge';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const dealsQuery = useDeals();
  const customersQuery = useCustomers();
  const journeysQuery = useJourneys();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const navigationItems = useMemo(() => [
    { icon: LayoutDashboard, label: 'Command Center', shortcut: 'G C', path: '/' },
    { icon: Handshake, label: 'Deals', shortcut: 'G D', path: '/deals' },
    { icon: GitPullRequest, label: 'Deal Desk', shortcut: 'G K', path: '/deal-desk' },
    { icon: Map, label: 'Journeys', shortcut: 'G J', path: '/journeys' },
    { icon: Target, label: 'Pipeline', shortcut: 'G P', path: '/pipeline' },
    { icon: Users, label: 'Customers', shortcut: 'G U', path: '/customers' },
    { icon: BarChart3, label: 'Analytics', shortcut: 'G A', path: '/analytics' },
    { icon: DollarSign, label: 'Financials', shortcut: 'G F', path: '/financials' },
    { icon: TrendingUp, label: 'Strategy', shortcut: 'G S', path: '/strategy' },
    { icon: Settings, label: 'Settings', shortcut: 'G ,', path: '/settings' },
  ], []);

  const quickActions = useMemo(() => [
    { icon: Plus, label: 'Create New Deal', action: () => navigate('/deals/new') },
    { icon: FileText, label: 'View Recent Reports', action: () => navigate('/analytics') },
    { icon: Sparkles, label: 'AI Deal Coach', action: () => navigate('/deals') },
  ], [navigate]);

  const recentDeals = useMemo(() => 
    (dealsQuery.data || []).slice(0, 5).map(deal => ({
      id: deal.id,
      name: deal.name,
      customer: deal.customer_name,
      classification: deal.classification,
    })),
    [dealsQuery.data]
  );

  const recentCustomers = useMemo(() =>
    (customersQuery.data || []).slice(0, 5).map(customer => ({
      id: customer.id,
      name: customer.name,
      tier: customer.tier,
    })),
    [customersQuery.data]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => runCommand(() => navigate(item.path))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                {item.shortcut}
              </kbd>
            </CommandItem>
          ))}
        </CommandGroup>
        
        {recentDeals.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Deals">
              {recentDeals.map((deal) => (
                <CommandItem
                  key={deal.id}
                  onSelect={() => runCommand(() => navigate(`/deals/${deal.id}`))}
                >
                  <Handshake className="mr-2 h-4 w-4" />
                  <span className="flex-1">{deal.name}</span>
                  <span className="text-muted-foreground text-sm">{deal.customer}</span>
                  {deal.classification && (
                    <Badge 
                      variant="outline" 
                      className={
                        deal.classification === 'green' ? 'bg-success/20 text-success border-success/30' :
                        deal.classification === 'yellow' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-destructive/20 text-destructive border-destructive/30'
                      }
                    >
                      {deal.classification}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        
        {recentCustomers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Customers">
              {recentCustomers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => runCommand(() => navigate(`/customers/${customer.id}`))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span className="flex-1">{customer.name}</span>
                  <Badge variant="outline" className="capitalize">
                    {customer.tier?.replace('_', ' ')}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}