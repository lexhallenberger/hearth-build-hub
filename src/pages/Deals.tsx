import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeals } from '@/hooks/useDeals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, FileText, Loader2, ArrowUpDown } from 'lucide-react';
import { Deal, STATUS_LABELS, STATUS_COLORS, CLASSIFICATION_COLORS, DealStatus } from '@/types/deals';
import { formatDistanceToNow } from 'date-fns';

export default function Deals() {
  const navigate = useNavigate();
  const { data: deals, isLoading } = useDeals();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'deal_value' | 'total_score'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredDeals = (deals || [])
    .filter((deal) => {
      const matchesSearch =
        deal.name.toLowerCase().includes(search.toLowerCase()) ||
        deal.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Manage and score your deals</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/deals/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Deals</CardTitle>
              <CardDescription>
                {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DealStatus | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No deals found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first deal'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={() => navigate('/deals/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Deal
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => toggleSort('deal_value')}
                      >
                        Value
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => toggleSort('total_score')}
                      >
                        Score
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => toggleSort('created_at')}
                      >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow
                      key={deal.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{deal.name}</div>
                        {deal.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {deal.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{deal.customer_name}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(deal.deal_value)}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[deal.status]}>
                          {STATUS_LABELS[deal.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.total_score !== null && deal.classification ? (
                          <div className="flex items-center gap-2">
                            <Badge className={CLASSIFICATION_COLORS[deal.classification]}>
                              {Math.round(deal.total_score)}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
