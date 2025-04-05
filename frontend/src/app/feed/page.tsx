import WebcamFeed from '../components/webcamFeed';

export default function WebcamPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <WebcamFeed />
      <button>Detect</button>
    </main>
  );
}
