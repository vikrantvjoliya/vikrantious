import AppLayout from "@/components/AppLayout";
import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';
import '../styles/global.css';

export default function FileNotesPage() {
  const userId = useGuestAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]); // List of uploaded files
  const [txtContents, setTxtContents] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { }, []);

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
    // eslint-disable-next-line
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

  return (
    <AppLayout>
      <section className="w-full flex flex-col items-center gap-8">
        <Card className="w-full max-w-xl mx-auto shadow-lg border border-gray-100 p-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 w-full">
              <Input type="file" ref={inputRef} onChange={handleFileChange} className="w-full max-w-md" />
              <Button onClick={handleUpload} disabled={!file || loading} className="w-full max-w-md">
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
              {error && <Alert variant="destructive">{error}</Alert>}
            </div>
          </CardContent>
        </Card>
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          {files.length === 0 && <p className="text-gray-500 text-center">No files uploaded yet.</p>}
          {files.map(f => {
            const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(f.name);
            const url = urlData?.publicUrl;
            if (!url) return null;
            if (f.name.endsWith('.txt')) {
              return (
                <Card key={f.name} className="shadow-md border border-gray-100">
                  <CardContent>
                    <h3 className="font-semibold mb-2">{f.name}</h3>
                    <pre className="text-sm font-mono bg-gray-50 rounded p-2 overflow-x-auto">{txtContents[f.name] || 'Loading...'}</pre>
                  </CardContent>
                </Card>
              );
            }
            if (f.name.endsWith('.pdf')) {
              return (
                <Card key={f.name} className="shadow-md border border-gray-100">
                  <CardContent>
                    <h3 className="font-semibold mb-2">{f.name}</h3>
                    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                      <iframe src={url} width="100%" height={500} title={f.name} className="w-full h-full border-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            }
            // Show a link for other file types
            return (
              <Card key={f.name} className="shadow-md border border-gray-100">
                <CardContent>
                  <h3 className="font-semibold mb-2">{f.name}</h3>
                  <a href={url} target="_blank" rel="noopener" className="inline-block px-4 py-2 border rounded bg-white text-blue-600 hover:bg-blue-50 transition">Download</a>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => inputRef.current?.click()}
                className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
                aria-label="Upload File"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload-cloud"><path d="M16 16l4 4m0-4-4 4M8 12H3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h6"/><path d="M13.5 4a4 4 0 0 1-8 0"/><path d="M19 16v6"/><path d="M22 19H16"/></svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload File</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
    </AppLayout>
  );
}
