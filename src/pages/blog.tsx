import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  BookOpen, 
  Tag, 
  ArrowRight,
  Filter,
  TrendingUp,
  Star
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
  views: number;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Modern Note-Taking',
    excerpt: 'Learn the fundamentals of effective note-taking in the digital age and how to organize your thoughts for maximum productivity.',
    content: 'Full article content here...',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Productivity',
    tags: ['note-taking', 'productivity', 'organization'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    featured: true,
    views: 1247
  },
  {
    id: '2',
    title: 'The Art of Digital Drawing: From Sketches to Masterpieces',
    excerpt: 'Discover techniques and tools for creating stunning digital artwork using modern drawing applications.',
    content: 'Full article content here...',
    author: 'Mike Chen',
    date: '2024-01-12',
    readTime: '8 min read',
    category: 'Design',
    tags: ['digital-art', 'drawing', 'creativity'],
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop',
    featured: true,
    views: 892
  },
  {
    id: '3',
    title: 'File Management Best Practices for Developers',
    excerpt: 'Organize your project files efficiently with these proven strategies and tools.',
    content: 'Full article content here...',
    author: 'Alex Rodriguez',
    date: '2024-01-10',
    readTime: '6 min read',
    category: 'Development',
    tags: ['file-management', 'development', 'organization'],
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
    featured: false,
    views: 567
  },
  {
    id: '4',
    title: 'The Psychology Behind Effective Learning',
    excerpt: 'Understanding how our brains process information can dramatically improve your learning efficiency.',
    content: 'Full article content here...',
    author: 'Dr. Emily Watson',
    date: '2024-01-08',
    readTime: '10 min read',
    category: 'Education',
    tags: ['learning', 'psychology', 'education'],
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
    featured: false,
    views: 445
  },
  {
    id: '5',
    title: 'Building a Personal Knowledge Management System',
    excerpt: 'Create your own comprehensive system for capturing, organizing, and retrieving information effectively.',
    content: 'Full article content here...',
    author: 'David Kim',
    date: '2024-01-05',
    readTime: '12 min read',
    category: 'Productivity',
    tags: ['knowledge-management', 'productivity', 'systems'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    featured: false,
    views: 678
  },
  {
    id: '6',
    title: 'The Future of Digital Collaboration Tools',
    excerpt: 'Explore emerging technologies that are reshaping how teams work together remotely.',
    content: 'Full article content here...',
    author: 'Lisa Thompson',
    date: '2024-01-03',
    readTime: '7 min read',
    category: 'Technology',
    tags: ['collaboration', 'remote-work', 'technology'],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    featured: false,
    views: 334
  }
];

const categories = ['All', 'Productivity', 'Design', 'Development', 'Education', 'Technology'];
const tags = ['note-taking', 'productivity', 'organization', 'digital-art', 'drawing', 'creativity', 'file-management', 'development', 'learning', 'psychology', 'education', 'knowledge-management', 'systems', 'collaboration', 'remote-work', 'technology'];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'readTime'>('date');

  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => post.tags.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'readTime':
          return parseInt(a.readTime) - parseInt(b.readTime);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Blog & Insights</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover tips, tutorials, and insights to enhance your productivity and creativity
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'views' | 'readTime')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Latest</option>
              <option value="views">Most Popular</option>
              <option value="readTime">Quick Reads</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "secondary"}
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => toggleTag(tag)}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {post.views} views
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Latest Articles ({regularPosts.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map(post => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    {post.category}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedTags([]);
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 