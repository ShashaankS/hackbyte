'use client';

import { useState, useRef, useEffect } from 'react';

interface CreditInfo {
  available: number;
  used: number;
  remaining: number;
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  modelId: string | null;
}

const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024; // 1GB in bytes

export default function ModelSetupPage() {
  // User credits state
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  
  // Upload states
  const [dataset, setDataset] = useState<File | null>(null);
  const [configJson, setConfigJson] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  });
  
  // Training state
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    isTraining: false,
    progress: 0,
    error: null,
    success: false,
    modelId: null
  });

  // File input references
  const datasetInputRef = useRef<HTMLInputElement>(null);
  const configInputRef = useRef<HTMLInputElement>(null);

  // Load user credits on component mount
  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    setIsLoadingCredits(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/user/credits');
      if (!response.ok) throw new Error('Failed to fetch credits');
      
      const data = await response.json();
      setCredits(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const handleDatasetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > MAX_UPLOAD_SIZE) {
        setUploadStatus({
          ...uploadStatus,
          error: 'Dataset exceeds the 1GB limit'
        });
        return;
      }
      
      setDataset(file);
      setUploadStatus({
        ...uploadStatus,
        error: null
      });
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate JSON file
      if (!file.name.endsWith('.json')) {
        setUploadStatus({
          ...uploadStatus,
          error: 'Configuration file must be JSON format'
        });
        return;
      }
      
      setConfigJson(file);
      setUploadStatus({
        ...uploadStatus,
        error: null
      });
    }
  };

  const handleTrainModel = async () => {
    // Validate uploads
    if (!dataset || !configJson) {
      setUploadStatus({
        ...uploadStatus,
        error: 'Please upload both dataset and configuration file'
      });
      return;
    }

    // Validate credits
    // if (!credits || credits.remaining < 1) {
    //   setUploadStatus({
    //     ...uploadStatus,
    //     error: 'Insufficient credits for training'
    //   });
    //   return;
    // }

    setUploadStatus({
      ...uploadStatus,
      isUploading: true,
      progress: 0,
      error: null
    });

    // Create form data for upload
    const formData = new FormData();
    formData.append('dataset', dataset);
    formData.append('config', configJson);

    try {
      // Simulated upload with progress
      const uploadInterval = setInterval(() => {
        setUploadStatus(prev => ({
          ...prev,
          progress: prev.progress + 10 > 100 ? 100 : prev.progress + 10
        }));
      }, 500);

      // Replace with your actual API endpoint
      const response = await fetch('/api/model/train', {
        method: 'POST',
        body: formData
      });

      clearInterval(uploadInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Training request failed');
      }
      
      const data = await response.json();
      
      setUploadStatus({
        isUploading: false,
        progress: 100,
        error: null,
        success: true
      });
      
      // Start tracking training progress
      setTrainingStatus({
        isTraining: true,
        progress: 0,
        error: null,
        success: false,
        modelId: data.modelId
      });
      
      // Start polling for training progress
      startTrainingProgressPolling(data.modelId);
      
      // Refresh credits after successful submission
      fetchUserCredits();
      
    } catch (error) {
      console.error('Error starting training:', error);
      setUploadStatus({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Failed to start training',
        success: false
      });
    }
  };

  const startTrainingProgressPolling = (modelId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/model/status/${modelId}`);
        if (!response.ok) throw new Error('Failed to get training status');
        
        const data = await response.json();
        
        setTrainingStatus(prev => ({
          ...prev,
          progress: data.progress,
          error: data.error || null,
          success: data.status === 'completed',
          isTraining: data.status === 'training'
        }));
        
        // Stop polling when training is complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval);
        }
        
      } catch (error) {
        console.error('Error polling training status:', error);
        setTrainingStatus(prev => ({
          ...prev,
          error: 'Failed to get training status',
          isTraining: false
        }));
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
  };

  const resetForm = () => {
    setDataset(null);
    setConfigJson(null);
    setUploadStatus({
      isUploading: false,
      progress: 0,
      error: null,
      success: false
    });
    setTrainingStatus({
      isTraining: false,
      progress: 0,
      error: null,
      success: false,
      modelId: null
    });
    
    // Reset file inputs
    if (datasetInputRef.current) datasetInputRef.current.value = '';
    if (configInputRef.current) configInputRef.current.value = '';
  };

  // Function to download sample config
  const downloadSampleConfig = () => {
    const link = document.createElement('a');
  link.href = '/downloads/yolov4-tiny-custom.cfg'; // relative to public/
  link.download = 'yolov4-tiny-custom.cfg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black border border-red-700 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-6">Object Detection Model Setup</h1>
          
          {/* Credits Section */}
          <div className="mb-8 p-4 bg-gray-900 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">Your Training Credits</h2>
            {isLoadingCredits ? (
              <div className="flex justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : credits ? (
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-gray-400 text-sm">Available</p>
                  <p className="text-white text-xl font-bold">{credits.available}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-gray-400 text-sm">Used</p>
                  <p className="text-white text-xl font-bold">{credits.used}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-gray-400 text-sm">Remaining</p>
                  <p className={`text-xl font-bold ${credits.remaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {credits.remaining}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-red-400">Failed to load credit information</p>
            )}
          </div>
          
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Training Data</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Dataset Upload */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <label className="block text-white mb-2">Dataset Upload (Max 1GB)</label>
                <div className="flex items-center">
                  <input
                    type="file"
                    ref={datasetInputRef}
                    onChange={handleDatasetChange}
                    className="hidden"
                    accept=".zip,.tar,.gz"
                    disabled={uploadStatus.isUploading || trainingStatus.isTraining}
                  />
                  <button
                    onClick={() => datasetInputRef.current?.click()}
                    className="bg-black border-1 border-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-md flex-grow"
                    disabled={uploadStatus.isUploading || trainingStatus.isTraining}
                  >
                    Select Dataset
                  </button>
                </div>
                {dataset && (
                  <div className="mt-2 text-sm text-white">
                    <p>Selected: {dataset.name}</p>
                    <p>Size: {(dataset.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
              
              {/* Config JSON Upload */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <label className="block text-white mb-2">Configuration File</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={configInputRef}
                    onChange={handleConfigChange}
                    className="hidden"
                    accept=""
                    disabled={uploadStatus.isUploading || trainingStatus.isTraining}
                  />
                  <button
                    onClick={() => configInputRef.current?.click()}
                    className="bg-black border-1 border-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-md flex-grow"
                    disabled={uploadStatus.isUploading || trainingStatus.isTraining}
                  >
                    Select Config
                  </button>
                </div>
                {configJson && (
                  <div className="mt-2 text-sm text-white">
                    <p>Selected: {configJson.name}</p>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  <a 
                    href="#" 
                    className="text-red-700 hover:text-red-500 underline" 
                    onClick={(e) => {
                      e.preventDefault();
                      downloadSampleConfig();
                    }}
                  >
                    Download sample configuration file
                  </a>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {uploadStatus.error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-md">
                {uploadStatus.error}
              </div>
            )}
          </div>
          
          {/* Training Section */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-white">Train Model</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleTrainModel}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!dataset || !configJson || uploadStatus.isUploading || trainingStatus.isTraining || (credits && credits.remaining < 1)}
                >
                  Train Model
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                  disabled={uploadStatus.isUploading || trainingStatus.isTraining}
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Upload Progress */}
            {uploadStatus.isUploading && (
              <div className="mb-4">
                <p className="text-white mb-2">Uploading files...</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Training Progress */}
            {trainingStatus.isTraining && (
              <div className="mb-4">
                <p className="text-white mb-2">Training in progress...</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${trainingStatus.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">Model ID: {trainingStatus.modelId}</p>
              </div>
            )}
            
            {/* Training Success */}
            {trainingStatus.success && (
              <div className="mt-4 p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-md">
                <p className="font-medium">Training completed successfully!</p>
                <p className="text-sm mt-1">Your model is now available for detection. Model ID: {trainingStatus.modelId}</p>
              </div>
            )}
            
            {/* Training Error */}
            {trainingStatus.error && !trainingStatus.isTraining && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-md">
                <p className="font-medium">Training failed</p>
                <p className="text-sm mt-1">{trainingStatus.error}</p>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-900 rounded-lg text-gray-300 text-sm">
            <h3 className="text-white font-medium mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Upload your labeled dataset (ZIP or TAR archive, max 1GB)</li>
              <li>Upload a configuration JSON file that defines your object classes</li>
              <li>Or download our sample configuration file and modify it for your needs</li>
              <li>Click &quot;Train Model&quot; to begin the training process</li>
              <li>Training requires 1 credit and may take several hours depending on dataset size</li>
              <li>Once training is complete, your model will be available for detection</li>
            </ol>
          </div>
          
          {/* Sample Config Format */}
          <div className="mt-4 p-4 bg-gray-900 rounded-lg text-gray-300 text-sm">
            <h3 className="text-white font-medium mb-2">Sample Configuration Format</h3>
            <p className="mb-2">Your configuration file should include the following information:</p>
            <pre className="bg-black p-3 rounded overflow-x-auto text-xs">
              {`{
  "model_name": "custom_detector",
  "classes": [
    { "id": 0, "name": "person" },
    { "id": 1, "name": "car" },
    ...
  ],
  "training_settings": {
    "batch_size": 16,
    "learning_rate": 0.001,
    "epochs": 100
  },
  "input_size": {
    "width": 416,
    "height": 416
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}