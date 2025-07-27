import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Palette, FileCheck, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.ts';
import { useGuestAuth } from '../hooks/useGuestAuth.tsx';

interface Stats {
  blogPosts: number;
  notes: number;
  drawings: number;
  pdfs: number;
}

export default function HomePage() {
  const userId = useGuestAuth();
  const [stats, setStats] = useState<Stats>({ blogPosts: 0, notes: 0, drawings: 0, pdfs: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStats();
      fetchRecentActivity();
    }
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [blogRes, notesRes, filesRes] = await Promise.all([
        supabase.from('blog_posts').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('text_notes').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.storage.from('notes-files').list('', { limit: 10 })
      ]);

      const files = filesRes.data || [];
      const drawings = files.filter(f => f.name.endsWith('.png')).length;
      const pdfs = files.filter(f => f.name.endsWith('.pdf')).length;

      setStats({
        blogPosts: blogRes.count || 0,
        notes: notesRes.count || 0,
        drawings,
        pdfs
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: notes } = await supabase
        .from('text_notes')
        .select('id, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      const activity = [
        ...(notes || []).map(n => ({ ...n, type: 'note' })),
        ...(blogs || []).map(b => ({ ...b, type: 'blog' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: BookOpen, label: 'New Blog Post', path: '/blog', color: 'bg-blue-500' },
    { icon: FileText, label: 'Quick Note', path: '/notes', color: 'bg-green-500' },
    { icon: Palette, label: 'Start Drawing', path: '/drawing', color: 'bg-purple-500' },
    { icon: FileCheck, label: 'Upload PDF', path: '/pdf', color: 'bg-orange-500' },
  ];

  const statCards = [
    { icon: BookOpen, label: 'Blog Posts', value: stats.blogPosts, color: 'text-blue-600 dark:text-blue-400' },
    { icon: FileText, label: 'Notes', value: stats.notes, color: 'text-green-600 dark:text-green-400' },
    { icon: Palette, label: 'Drawings', value: stats.drawings, color: 'text-purple-600 dark:text-purple-400' },
    { icon: FileCheck, label: 'PDFs', value: stats.pdfs, color: 'text-orange-600 dark:text-orange-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="card p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal workspace for blogs, notes, drawings, and documents.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 mr-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="flex flex-col items-center p-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div className={`p-3 rounded-full ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Create your first content to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`p-2 rounded-lg ${item.type === 'blog' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                    {item.type === 'blog' ? (
                      <BookOpen className={`w-4 h-4 ${item.type === 'blog' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                    ) : (
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.type === 'blog' ? item.title : item.content.substring(0, 50) + '...'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}