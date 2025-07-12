import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';
import { FolderOpen, Upload, Download, FileText, FileImage, FileVideo, Trash2, Eye } from 'lucide-react';
import '../styles/global.css';

export default function FileNotesPage() {
  const userId = useGuestAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [txtContents, setTxtContents] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all files for this user
  const fetchFiles = async () => {
    if (!userId) return;
    const { data, error } = await supabase.storage.from('notes-files').list('', { limit: 100 });
    if (error) {
      setError(error.message);
      return;
    }
    setFiles(data || []);
    
    // Fetch .txt content for each .txt file
    (data || []).forEach(async (file: any) => {
      if (file.name.endsWith('.txt')) {
        const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(file.name);
        if (urlData?.publicUrl) {
          fetch(urlData.publicUrl)
            .then(res => res.text())
            .then(content => setTxtContents(prev => ({ ...prev, [file.name]: content })))
            .catch(() => setTxtContents(prev => ({ ...prev, [file.name]: 'Error loading file content.' })));
        }
      }
    });
  };

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const { error: uploadError } = await supabase.storage.from('notes-files').upload(file.name, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setFile(null);
    fetchFiles();
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage.from('notes-files').remove([fileName]);
    if (error) {
      setError(error.message);
      return;
    }
    fetchFiles();
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.txt')) return <FileText className="h-5 w-5" />;
    if (fileName.endsWith('.pdf')) return <FileText className="h-5 w-5" />;
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return <FileImage className="h-5 w-5" />;
    if (fileName.match(/\.(mp4|avi|mov|wmv)$/i)) return <FileVideo className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <FolderOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Notes</h1>
          <p className="text-gray-600">Upload and manage files, PDFs, and more for your projects</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Input 
                  type="file" 
                  ref={inputRef} 
                  onChange={handleFileChange} 
                  className="w-full"
                  accept="*/*"
                />
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={!file || loading} 
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {error && <Alert variant="destructive">{error}</Alert>}
            {file && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {file.name} ({formatFileSize(file.size)})
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Files</h2>
          <span className="text-sm text-gray-500">{files.length} file{files.length !== 1 ? 's' : ''}</span>
        </div>
        
        {files.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No files uploaded yet. Upload your first file above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {files.map(f => {
              const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(f.name);
              const url = urlData?.publicUrl;
              if (!url) return null;

              if (f.name.endsWith('.txt')) {
                return (
                  <Card key={f.name} className="shadow-sm border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(f.name)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{f.name}</h3>
                            <p className="text-sm text-gray-500">{formatFileSize(f.metadata?.size || 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(f.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <pre className="text-sm font-mono bg-gray-50 rounded-lg p-3 overflow-x-auto border">
                        {txtContents[f.name] || 'Loading...'}
                      </pre>
                    </CardContent>
                  </Card>
                );
              }

              if (f.name.endsWith('.pdf')) {
                return (
                  <Card key={f.name} className="shadow-sm border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(f.name)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{f.name}</h3>
                            <p className="text-sm text-gray-500">{formatFileSize(f.metadata?.size || 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(f.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <iframe src={url} width="100%" height={500} title={f.name} className="w-full h-full border-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={f.name} className="shadow-sm border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(f.name)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{f.name}</h3>
                          <p className="text-sm text-gray-500">{formatFileSize(f.metadata?.size || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(f.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Upload Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => inputRef.current?.click()}
              className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50"
              aria-label="Upload File"
            >
              <Upload className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload File</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
