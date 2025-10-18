'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Mail,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PendingInvite } from '@/types/class-based-learning/classInvite.type';
import { useToast } from '@/hooks/use-toast';

interface PendingInvitesListProps {
  invites: PendingInvite[];
  onCancel: (inviteId: number) => Promise<void>;
  onResend: (inviteId: number) => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
}

export function PendingInvitesList({
  invites,
  onCancel,
  onResend,
  onRefresh,
  loading = false,
}: PendingInvitesListProps) {
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const getStatusIcon = (status: PendingInvite['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: PendingInvite['status']) => {
    const variants = {
      pending: 'default' as const,
      accepted: 'default' as const,
      rejected: 'destructive' as const,
      expired: 'secondary' as const,
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
    return `${diffMinutes}m`;
  };

  const handleCancel = async (inviteId: number) => {
    setActionLoading(prev => ({ ...prev, [inviteId]: 'cancel' }));
    try {
      await onCancel(inviteId);
      toast({
        title: "Success",
        description: "Invitation cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[inviteId];
        return newState;
      });
    }
  };

  const handleResend = async (inviteId: number) => {
    setActionLoading(prev => ({ ...prev, [inviteId]: 'resend' }));
    try {
      await onResend(inviteId);
      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[inviteId];
        return newState;
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (invites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending invitations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Pending Invitations ({invites.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.inviteId} className="hover:bg-gray-50/50 transition-colors duration-200">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {invite.invitedUserName ? getInitials(invite.invitedUserName) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {invite.invitedUserName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invite.invitedEmail}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invite.status)}
                    {getStatusBadge(invite.status)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatTimeRemaining(invite.expiresAt)}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {invite.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResend(invite.inviteId)}
                          disabled={actionLoading[invite.inviteId] === 'resend'}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(invite.inviteId)}
                          disabled={actionLoading[invite.inviteId] === 'cancel'}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {invite.status === 'expired' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(invite.inviteId)}
                        disabled={actionLoading[invite.inviteId] === 'resend'}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Resend
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
