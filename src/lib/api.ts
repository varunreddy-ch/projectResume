const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  }

  // Auth methods
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }

  async signIn(email: string, password: string) {
    const data = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  }

  async signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    if (!this.token) return null;
    return this.request('/auth/me');
  }

  async resetPassword(email: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Resume methods
  async checkResumeUsage() {
    return this.request('/resumes/usage');
  }

  async generateResume(data: any) {
    return this.request('/resumes/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateResumeWithJobDescription(data: { resumeId: string; jobDescription: string }) {
    return this.request('/resumes/generate-with-job', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserResumes() {
    return this.request('/resumes');
  }

  async getResume(id: string) {
    return this.request(`/resumes/${id}`);
  }

  async deleteResume(id: string) {
    return this.request(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log(`Uploading file to: ${API_BASE_URL}/upload`);
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `Upload failed with status ${response.status}` }));
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  }

  // Profile methods
  async updateProfile(data: { firstName: string; lastName: string }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Subscription methods - Fixed to return promises properly
  async checkSubscription() {
    return this.request('/subscription/status');
  }

  async createCheckoutSession() {
    return this.request('/subscription/checkout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
