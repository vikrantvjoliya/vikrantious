import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';
import { Brush, Save, Download, Trash2, RotateCcw, Palette } from 'lucide-react';
import '../styles/global.css';

export default function DrawingNotesPage() {
  const userId = useGuestAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#3B82F6');

  useEffect(() => {
    handleLoad();
  }, [userId]);

  const handleMouseDown = () => setDrawing(true);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = brushColor;
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };
  
  const handleMouseUp = () => {
    setDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };
  
  const handleClear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };
  
  const handleSave = async () => {
    if (!canvasRef.current || !userId) return;
    setLoading(true);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `drawing-${userId}-${Date.now()}.png`;
    await supabase.storage.from('notes-files').upload(fileName, blob, { upsert: true, contentType: 'image/png' });
    const { data } = supabase.storage.from('notes-files').getPublicUrl(fileName);
    setImgUrl(data.publicUrl);
    setLoading(false);
  };
  
  const handleLoad = async () => {
    if (!userId) return;
    const fileName = `drawing-${userId}.png`;
    const { data } = supabase.storage.from('notes-files').getPublicUrl(fileName);
    if (data.publicUrl) setImgUrl(data.publicUrl);
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#000000'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Brush className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drawing Notes</h1>
          <p className="text-gray-600">Sketch ideas and diagrams with a simple, intuitive canvas</p>
        </div>
      </div>

      {/* Drawing Canvas */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Colors:</span>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      brushColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
              </div>

              <div className="flex items-center space-x-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={handleLoad}>
                  <Download className="h-4 w-4 mr-1" />
                  Load
                </Button>
                <Button onClick={handleSave} disabled={loading} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border border-gray-200 rounded-lg bg-white shadow-sm cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Drawing */}
      {imgUrl && (
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Saved Drawing</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImgUrl(null)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            <div className="flex justify-center">
              <img 
                src={imgUrl} 
                alt="Saved Drawing" 
                className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Clear Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50"
              onClick={handleClear}
              aria-label="Clear Canvas"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Canvas</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
