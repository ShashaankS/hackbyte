'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white transition-colors duration-500">
      {/* Body */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/globe.svg"
          alt="OpenCV Background"
          fill
          className="absolute z-0 opacity-30 object-cover"
        />
        <div className="z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Computer Vision, Simplified.</h2>
          <p className="text-lg text-red-700">Explore real-time detection, processing, and analysis using OpenCV</p>
        </div>
      </section>

      {/* Bottom Right Navigation */}
      <div className="fixed bottom-4 right-4 z-20">
        <Link
            href="/setup"
            className="bg-black hover:border-2 hover:border-red-700 hover:font-bold text-red-600 border-1 border-red-700 py-2 px-4 rounded-md inline-block"
            >
            Go to Detection
        </Link>
      </div>
    </main>
  );
}
