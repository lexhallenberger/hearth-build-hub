import { useState } from 'react';
import { useLeads, useDeleteLead, useUpdateLead } from '@/hooks/usePipeline';
import { Lead, LEAD_STATUS_CONFIG, LeadStatus } from '@/types/pipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Search, MoreHorizontal, ArrowRightCircle, Trash2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { LeadFormDialog } from './LeadFormDialog';
import { ConvertLeadDialog } from './ConvertLeadDialog';

export function LeadsList() {
  const { data: leads, isLoading } = useLeads();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      lead.company?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    updateLead.mutate({ id: lead.id, status: newStatus });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading leads...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leads</CardTitle>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(LEAD_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeads && filteredLeads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.first_name} {lead.last_name}
                    {lead.title && (
                      <span className="block text-sm text-muted-foreground">{lead.title}</span>
                    )}
                  </TableCell>
                  <TableCell>{lead.company || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lead.source || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead, value as LeadStatus)}
                      disabled={lead.status === 'converted'}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <Badge className={LEAD_STATUS_CONFIG[lead.status].color}>
                          {LEAD_STATUS_CONFIG[lead.status].label}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEAD_STATUS_CONFIG)
                          .filter(([key]) => key !== 'converted')
                          .map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <Badge className={config.color}>{config.label}</Badge>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.score || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {lead.status === 'qualified' && (
                          <DropdownMenuItem onClick={() => setConvertingLead(lead)}>
                            <ArrowRightCircle className="h-4 w-4 mr-2" />
                            Convert to Opportunity
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteLead.mutate(lead.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p>No leads found</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>
              Add your first lead
            </Button>
          </div>
        )}
      </CardContent>

      <LeadFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {convertingLead && (
        <ConvertLeadDialog
          lead={convertingLead}
          open={!!convertingLead}
          onOpenChange={() => setConvertingLead(null)}
        />
      )}
    </Card>
  );
}
