import AppLayout from "@/components/AppLayout";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import '../styles/global.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('username', username);
      setLoading(false);
      window.location.href = '/';
    }, 800);
  };

  return (
    <AppLayout>
      <section className="w-full flex flex-col items-center gap-8">
        <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-100 p-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !username.trim()} className="w-full">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              {error && <Alert variant="destructive">{error}</Alert>}
            </form>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
