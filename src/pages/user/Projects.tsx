import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project } from '@/types/resources';

export default function Projects() {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get<Project[]>('/user/projects');
        if (!ignore) setData(res.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        alert('Failed to load projects');
      } finally {
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-4 h-8 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">My Projects</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => (
          <Card key={p.id} className="bg-white">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <Badge variant={p.status === 'active' ? 'default' : p.status === 'completed' ? 'secondary' : 'outline'}>
                {p.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{p.description || 'No description'}</p>
              <p className="mt-3 text-xs text-gray-400">Updated: {new Date(p.updatedAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-500">No projects yet.</p>}
      </div>
    </div>
  );
}