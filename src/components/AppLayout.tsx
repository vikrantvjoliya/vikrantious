import type { ReactNode } from "react";
import { useState } from "react";
import { Menu, X, Home, FileText, Brush, FolderOpen, Gamepad2, LogOut, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeSelector from "./ThemeSelector";

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Text Notes', href: '/text-notes', icon: FileText },
  { name: 'Drawing Notes', href: '/drawing-notes', icon: Brush },
  { name: 'File Notes', href: '/file-notes', icon: FolderOpen },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Suika Game', href: '/suika-game', icon: Gamepad2 },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Vikrantious</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 pt-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Vikrantious</h1>
            <ThemeSelector />
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 pt-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Vikrantious</h1>
            <ThemeSelector />
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
