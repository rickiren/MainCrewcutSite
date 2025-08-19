interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `${endpoint}${paramString}`;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Health endpoints
  async getHealth(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  async getCounters(): Promise<ApiResponse<any>> {
    return this.request('/counters');
  }

  // Posts endpoints
  async getPosts(params?: { since?: string; niche?: string }): Promise<ApiResponse<any[]>> {
    const cacheKey = this.getCacheKey('/posts', params);
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) return { data: cached, status: 200 };

    const response = await this.request<any[]>('/posts', {
      method: 'GET',
    });

    if (response.data) {
      this.setCache(cacheKey, response.data);
    }

    return response;
  }

  // Queue endpoints
  async getQueue(params?: { kind?: string; niche?: string }): Promise<ApiResponse<any[]>> {
    const cacheKey = this.getCacheKey('/queue', params);
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) return { data: cached, status: 200 };

    const response = await this.request<any[]>('/queue', {
      method: 'GET',
    });

    if (response.data) {
      this.setCache(cacheKey, response.data);
    }

    return response;
  }

  // Drafts endpoints
  async getDraftComments(): Promise<ApiResponse<any[]>> {
    return this.request('/drafts/comments');
  }

  async getDraftOutreach(): Promise<ApiResponse<any[]>> {
    return this.request('/drafts/outreach');
  }

  async getDraftReplies(): Promise<ApiResponse<any[]>> {
    return this.request('/drafts/replies');
  }

  async clearDrafts(kind?: string): Promise<ApiResponse<void>> {
    return this.request('/drafts/clear', {
      method: 'POST',
      body: JSON.stringify({ kind }),
    });
  }

  // Settings endpoints
  async getNicheSettings(): Promise<ApiResponse<any>> {
    return this.request('/settings/niche');
  }

  async updateNicheSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/settings/niche', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Control endpoints
  async pause(): Promise<ApiResponse<void>> {
    return this.request('/pause', {
      method: 'POST',
    });
  }

  async resume(): Promise<ApiResponse<void>> {
    return this.request('/resume', {
      method: 'POST',
    });
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };
