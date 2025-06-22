'use client';

import { useParams } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface AuthAccount {
  authAccountId: number;
  userId: number;
  provider: string;
  providerId: string;
  createdAt: string;
}

export default function OAuthPage() {
  const params = useParams();
  const userId = params?.id;

  const {
    data: response,
    loading,
    error,
  } = useFetch<AuthAccount[]>(`/admin/users/${userId}/auth-accounts`);

  const accounts = response || [];


  if (loading) return <Skeleton className="w-full h-[200px]" />;
  if (error) return <p className="text-destructive">Errors: {error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Affiliate account</h2>

      {accounts.length === 0 && (
        <p className="text-muted-foreground">User has no OAuth account associated.</p>
      )}

      {accounts.map((account) => (
        <Card key={account.authAccountId}>
          <CardContent className="p-4 space-y-2">
            <p>
              <strong>Provider:</strong>{' '}
              <Badge variant="outline" className="capitalize">
                {account.provider}
              </Badge>
            </p>
            <p>
              <strong>Provider ID:</strong> {account.providerId}
            </p>
            <p className="text-sm text-muted-foreground">
              Linked{' '}
              {formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
