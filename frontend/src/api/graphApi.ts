  // src/api/graphApi.ts
  import axios from 'axios';
  import { AnalysisResults } from '@/types/graph'; // Import the result type

  // Get backend URL from environment variable or default
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'; // Ensure Flask runs on 5001 or change port

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  interface GraphPayload {
     nodes: { [key: string]: any };
     edges: Array<{ source: string; target: string; label?: string }>;
  }

  export const runAnalysis = async (graphData: GraphPayload): Promise<AnalysisResults> => {
    try {
      console.log('Sending data to /api/analyze:', graphData);
      const response = await apiClient.post<AnalysisResults>('/api/analyze', graphData);
      console.log('Received analysis response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API call failed:', error);
      let errorMessage = 'Failed to run analysis. Check backend connection.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        errorMessage = `Analysis failed: ${error.response.data?.error || error.response.statusText || 'Server error'}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        errorMessage = 'Analysis failed: No response received from server.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage = `Analysis failed: ${error.message}`;
      }
       // Re-throw a more specific error or return an error structure
       throw new Error(errorMessage);
       // Alternatively: return { error: errorMessage } if Promise<AnalysisResults> allows it
    }
  };

  // Add other API calls here (e.g., saveGraph, loadGraph) if needed later