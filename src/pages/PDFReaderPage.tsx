import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Eye, Search } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../hooks/useGuestAuth.tsx';


interface PDFFile {
  name: string;
  url: string;
  uploadedAt: string;
  size: number;
}

export default function PDFReaderPage() {
  const userId = useGuestAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PDFFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (userId) {
      loadPDFFiles();
    }
  }, [userId]);

  const loadPDFFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('notes-files')
        .list('', { limit: 100 });

      if (error) throw error;

      const pdfs = data
        ?.filter(file => file.name.endsWith('.pdf'))
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('notes-files')
            .getPublicUrl(file.name);
          return {
            name: file.name,
            url: urlData.publicUrl,
            uploadedAt: file.created_at || new Date().toISOString(),
            size: file.metadata?.size || 0
          };
        }) || [];

      setPdfFiles(pdfs);
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  };

  const deletePDF = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;

    try {
      const { error } = await supabase.storage
        .from('notes-files')
        .remove([fileName]);

      if (error) throw error;

      if (selectedPdf?.name === fileName) {
        setSelectedPdf(null);
      }

      await loadPDFFiles();
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const filteredPDFs = pdfFiles.filter(pdf =>
    pdf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Move handleFileUpload inside the component so it can access state
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setUploading(true);
    try {
      const fileName = `${userId}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('notes-files')
        .upload(fileName, file, {
          contentType: 'application/pdf',
          upsert: false
        });
      if (error) throw error;
      await loadPDFFiles();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Error uploading PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PDF Reader</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload and view PDF documents</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PDFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* PDF List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Area */}
          <div
            className={`card p-6 border-2 border-dashed transition-all ${
              dragOver
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop PDF files here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                browse to upload
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* PDF Files List */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your PDFs ({filteredPDFs.length})
            </h3>
            
            {filteredPDFs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No PDFs found' : 'No PDFs uploaded yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPDFs.map((pdf) => (
                  <div
                    key={pdf.name}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedPdf?.name === pdf.name
                        ? 'border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPdf(pdf)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {pdf.name.replace(/^\d+-\d+-/, '')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(pdf.size)} • {new Date(pdf.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(pdf.url, '_blank');
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = pdf.url;
                            link.download = pdf.name;
                            link.click();
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePDF(pdf.name);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            {selectedPdf ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {selectedPdf.name.replace(/^\d+-\d+-/, '')}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(selectedPdf.url, '_blank')}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    src={`${selectedPdf.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-96 md:h-[600px]"
                    title={selectedPdf.name}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No PDF Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a PDF from the list to view it here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



