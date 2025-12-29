
import React, { useRef, useEffect, useState } from 'react';

interface SignatureCanvasProps {
  onSignatureEnd: (signature: string) => void;
  width?: number;
  height?: number;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignatureEnd, width = 400, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (context) {
      // Get the foreground color from computed CSS styles
      const foregroundColor = getComputedStyle(canvas).getPropertyValue('--foreground');
      context.lineCap = 'round';
      context.strokeStyle = foregroundColor.trim();
      context.lineWidth = 2;
    }
  }, []);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { offsetX, offsetY } = getCoordinates(event);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { offsetX, offsetY } = getCoordinates(event);
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSigned) {
      onSignatureEnd(canvas.toDataURL());
    }
  };

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if(!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    return {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      onSignatureEnd('');
      setHasSigned(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-secondary border border-border rounded-md cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="mt-2 btn btn-secondary text-sm"
      >
        Hapus Tanda Tangan
      </button>
    </div>
  );
};

export default SignatureCanvas;