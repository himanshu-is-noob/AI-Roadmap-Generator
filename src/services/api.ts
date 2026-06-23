export interface GenerateRoadmapRequest {
  prompt: string;
  category: string;
  travelData?: {
    destination: string;
    startingLocation: string;
    duration: number;
    travelers: number;
    budget: number;
  };
}

export interface GenerateRoadmapResponse {
  success: boolean;
  projectName?: string;
  phases?: Array<{
    number: number;
    name: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  }>;
  roadmapNodes?: any[];
  category?: string;
  originalPrompt?: string;
  timestamp: string;
  error?: string;
  note?: string;
  aiResponse?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hireready-airoadmap.onrender.com/'
  : 'http://localhost:3001';

export class ApiService {
  static async generateRoadmap(request: GenerateRoadmapRequest): Promise<GenerateRoadmapResponse> {
    try {
      const apiUrl = `${API_BASE_URL}/api/generate-roadmap`;
      console.log('Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers.get('content-type'));

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Received non-JSON response:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Please check if the backend server is running.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 3001.');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to generate roadmap');
    }
  }

  static async generateInstructions(stepDescription: string): Promise<string[]> {
    try {
      const apiUrl = `${API_BASE_URL}/api/generate-instructions`;
      console.log('Making instructions API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stepDescription }),
      });

      console.log('Instructions API Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Received non-JSON response:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Please check if the backend server is running.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Instructions API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Instructions API Response data:', data);
      
      if (data.success && data.instructions) {
        return data.instructions;
      } else {
        throw new Error(data.error || 'Failed to generate instructions');
      }
    } catch (error) {
      console.error('Instructions API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 3001.');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to generate instructions');
    }
  }
}