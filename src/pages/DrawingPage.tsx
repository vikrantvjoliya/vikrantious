import { useState, useRef, useEffect } from 'react';
import { Save, Download, Trash2, Palette, Eraser, RotateCcw } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.ts';
import { useGuestAuth } from '../hooks/useGuestAuth.tsx';

export default function DrawingPage() {
  const userId = useGuestAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#6b7280', '#000000'
  ];

  useEffect(() => {
    if (userId) {
      loadSavedDrawings();
      initializeCanvas();
    }
  }, [userId]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const loadSavedDrawings = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('notes-files')
        .list('', { limit: 100 });

      if (error) throw error;

      const drawings = data
        ?.filter(file => file.name.startsWith(`drawing-${userId}`) && file.name.endsWith('.png'))
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('notes-files')
            .getPublicUrl(file.name);
          return urlData.publicUrl;
        }) || [];

      setSavedDrawings(drawings);
    } catch (error) {
      console.error('Error loading drawings:', error);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !userId) return;

    setLoading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const fileName = `drawing-${userId}-${Date.now()}.png`;

      const { error } = await supabase.storage
        .from('notes-files')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) throw error;

      await loadSavedDrawings();
    } catch (error) {
      console.error('Error saving drawing:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Canvas</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and save your drawings</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Drawing Tools */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tool Selection */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTool('brush')}
                className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                  tool === 'brush'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Palette className="w-5 h-5" />
                <span className="text-xs">Brush</span>
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                  tool === 'eraser'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Eraser className="w-5 h-5" />
                <span className="text-xs">Eraser</span>
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Colors</h3>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    currentColor === color
                      ? 'border-gray-400 dark:border-gray-300 scale-110'
                      : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Brush Size: {brushSize}px
            </h3>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="card p-4">
            <div className="space-y-2">
              <button
                onClick={saveDrawing}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={downloadDrawing}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={clearCanvas}
                className="w-full btn-secondary flex items-center justify-center space-x-2 text-red-600 dark:text-red-400"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseLeave={stopDrawing}
                className="border border-gray-200 dark:border-gray-700 rounded-lg cursor-crosshair max-w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Saved Drawings */}
      {savedDrawings.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Saved Drawings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedDrawings.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Drawing ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <a
                    href={url}
                    download
                    className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}