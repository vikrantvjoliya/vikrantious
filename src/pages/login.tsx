import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Sparkles, User, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Vikrantious</h1>
          </div>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 w-full"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 w-full"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="text-sm">
                  {error}
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={loading || !username.trim()} 
                className="w-full h-12 text-base font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                💡 <strong>Demo Mode:</strong> Enter any username to continue
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            A modern note-taking and productivity suite
          </p>
        </div>
      </div>
    </div>
  );
}
