'use client';

import { useState, useEffect, useRef } from 'react';

interface DetectionResult {
  [key: string]: unknown;
}

export default function WebcamPage() {
  const [detectionLog, setDetectionLog] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [timestamp, setTimestamp] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Detection interval
  useEffect(() => {
    if (isDetecting) {
      intervalRef.current = setInterval(() => {
        captureAndDetect();
        // Update timestamp
        const now = new Date();
        setTimestamp(now.toLocaleTimeString());
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDetecting]);

  const captureAndDetect = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      const timestampedData = {
        ...data,
        timestamp: new Date().toISOString()
      };
      
      // Add to log instead of replacing
      setDetectionLog(prevLog => [...prevLog, timestampedData]);
      
      console.log('New detection:', timestampedData);
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  const clearLog = () => {
    setDetectionLog([]);
  };

  return (
    <main className="min-h-full bg-black p-6">
      <div className="flex h-full gap-4">
        {/* Left Pane: Video Feed */}
        <div className="w-2/5 p-4 border border-red-700 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4 text-white">Live Space Station Feed</h2>
          <video
            ref={videoRef}
            className="w-full rounded"
            autoPlay
            muted
            playsInline
          />  
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsDetecting(!isDetecting)}
              className={`px-4 py-2 rounded ${
                isDetecting
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isDetecting ? 'Stop Detection' : 'Start Detection'}
            </button>
            <button
              onClick={clearLog}
              className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
            >
              Clear Log
            </button>
          </div>
          {timestamp && (
            <div className="mt-2 text-white">
              Last detection: {timestamp}
            </div>
          )}
        </div>

        {/* Right Pane: Detections Log */}
        <div className="w-2/5 p-4 bg-black rounded shadow-md border border-red-700">
          <h2 className="text-xl font-bold mb-4 text-white">
            AI Safety Detections Log 
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({detectionLog.length} entries)
            </span>
          </h2>
          <div className="bg-black p-4 rounded max-h-96 overflow-auto">
            {detectionLog.length > 0 ? (
              detectionLog.map((detection, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-300">
                  <div className="font-bold text-sm text-white">
                    {new Date(detection.timestamp as string).toLocaleTimeString()}
                  </div>
                  <pre className="text-sm text-white mt-1">
                    {JSON.stringify(detection, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No detections yet. Click &quot;Start Detection&quot; to begin.</p>
            )}
          </div>
        </div>

        <div className="w-1/5 p-4 bg-black rounded shadow-md border border-red-700">
            <h2 className="text-xl font-bold mb-4 text-white">
              Voice Integration 
            </h2>
          </div>
      </div>
    </main>
  );
}