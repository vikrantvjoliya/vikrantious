import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Calendar, Search } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.ts';
import { useGuestAuth } from '../hooks/useGuestAuth.tsx';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function BlogPage() {
  const userId = useGuestAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const savePost = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    try {
      if (editingPost) {
        await supabase
          .from('blog_posts')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', editingPost.id);
      } else {
        await supabase
          .from('blog_posts')
          .insert([{ user_id: userId, title, content }]);
      }
      
      resetForm();
      await fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsCreating(false);
    setEditingPost(null);
  };

  const startEditing = (post: BlogPost) => {
    setTitle(post.title);
    setContent(post.content);
    setEditingPost(post);
    setIsCreating(true);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          <p className="text-gray-600 dark:text-gray-400">Write and manage your blog posts</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="card p-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
            <textarea
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-transparent border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={savePost}
                disabled={loading || !title.trim() || !content.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingPost ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No posts found' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first blog post to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreating(true)}
                className="btn-primary"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    {post.updated_at !== post.created_at && (
                      <span>• Updated {new Date(post.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditing(post)}
                    className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.content.length > 300 
                    ? post.content.substring(0, 300) + '...' 
                    : post.content
                  }
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}