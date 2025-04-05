'use client';

import { useState, useEffect, useRef } from 'react';

interface DetectionResult {
  [key: string]: unknown;
}

export default function WebcamPage() {
  const [detectionLog, setDetectionLog] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start webcam stream on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }).catch((err) => {
      console.error('Webcam error:', err);
    });
  }, []);

  const captureAndCheck = async () => {
    setIsProcessing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setIsProcessing(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Match canvas to video resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    try {
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Detection failed');
      const data = await response.json();
      
      // Add timestamp to detection data
      const now = new Date();
      const timestampedData = {
        ...data,
        timestamp: now.toISOString()
      };
      
      // Add to log
      setDetectionLog(prevLog => [...prevLog, timestampedData]);
      setLastChecked(now.toLocaleTimeString());
      
      console.log('Check result:', timestampedData);
    } catch (error) {
      console.error('Detection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearLog = () => {
    setDetectionLog([]);
  };

  return (
    <main className="min-h-screen bg-black p-4">
      {/* Stack vertically on mobile, side by side on desktop */}
      <div className="flex flex-col md:flex-row md:h-full gap-4">
        {/* Top/Left Pane: Video Feed */}
        <div className="w-full md:w-1/2 p-4 border border-red-700 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4 text-white">Your Feed</h2>
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded"
              autoPlay
              muted
              playsInline
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={captureAndCheck}
              disabled={isProcessing}
              className={`px-4 py-2 rounded ${
                isProcessing
                  ? 'bg-gray-500'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white flex items-center justify-center min-w-28`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Check Now'
              )}
            </button>
            <button
              onClick={clearLog}
              className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
            >
              Clear Log
            </button>
          </div>
          {lastChecked && (
            <div className="mt-2 text-white">
              Last checked: {lastChecked}
            </div>
          )}
        </div>

        {/* Bottom/Right Pane: Split between Detections Log and Voice */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {/* Detections Log */}
          <div className="w-full p-4 bg-black rounded shadow-md border border-red-700">
            <h2 className="text-xl font-bold mb-4 text-white">
              AI Safety Detections Log 
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({detectionLog.length} entries)
              </span>
            </h2>
            <div className="bg-black p-4 rounded max-h-64 md:max-h-96 overflow-auto">
              {detectionLog.length > 0 ? (
                detectionLog.map((detection, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-gray-300">
                    <div className="font-bold text-sm text-white">
                      {new Date(detection.timestamp as string).toLocaleTimeString()}
                    </div>
                    <pre className="text-sm text-white mt-1 overflow-x-auto">
                      {JSON.stringify(detection, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No detections yet. Click &quot;Check Now&quot; to analyze the current frame.</p>
              )}
            </div>
          </div>

          {/* Voice Integration - Hidden on small screens */}
          <div className="w-full p-4 bg-black rounded shadow-md border border-red-700 hidden md:block">
            <h2 className="text-xl font-bold mb-4 text-white">
              Voice Integration 
            </h2>
            {/* Voice content goes here */}
          </div>
        </div>
      </div>
    </main>
  );
}