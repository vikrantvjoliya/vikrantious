import AppLayout from "@/components/AppLayout";
import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { supabase } from '../utils/supabaseClient';
import { useGuestAuth } from '../utils/useGuestAuth';
import '../styles/global.css';

export default function DrawingNotesPage() {
  const userId = useGuestAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => { }, []);

  const handleMouseDown = () => setDrawing(true);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#90caf9';
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
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };
  const handleSave = async () => {
    if (!canvasRef.current || !userId) return;
    setLoading(true);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `drawing-${userId}.png`;
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
  return (
    <AppLayout>
      <section className="w-full flex flex-col items-center gap-8">
        <Card className="w-full max-w-xl mx-auto shadow-lg border border-gray-100 p-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-row gap-3 w-full justify-center">
              <Button variant="outline" onClick={handleClear}>Clear</Button>
              <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button onClick={handleLoad}>Load</Button>
            </div>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="drawing-canvas border border-gray-200 rounded-lg bg-gray-50"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </CardContent>
        </Card>
        {imgUrl && (
          <Card className="w-full max-w-xl mx-auto shadow-lg border border-gray-100">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="text-sm font-semibold mb-2">Saved Drawing:</div>
              <img src={imgUrl} alt="Saved Drawing" className="drawing-image max-w-full border border-gray-200 rounded-lg" />
            </CardContent>
          </Card>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
                onClick={handleClear}
                aria-label="Clear Canvas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
    </AppLayout>
  );
}
