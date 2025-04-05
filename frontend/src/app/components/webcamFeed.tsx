'use client';

import { useEffect, useRef } from 'react';

export default function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
      }
    };

    startCamera();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold text-center mb-4">Your Camera Feed</h2>
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-300">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};
