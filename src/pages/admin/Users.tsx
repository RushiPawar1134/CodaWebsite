import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/types/auth';

export default function Users() {
  const [data, setData] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get<User[]>('/api/admin/users');
        if (!ignore) {
          setData(res.data);
          setFiltered(res.data);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        alert('Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    const lower = q.toLowerCase();
    setFiltered(
      data.filter(u =>
        u.email.toLowerCase().includes(lower) ||
        (u.name || '').toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower)
      )
    );
  }, [q, data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <Input
          placeholder="Search users..."
          className="w-64"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div className="flex items-center gap-3" key={i}>
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{(u.name || u.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.name || '—'}</span>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}