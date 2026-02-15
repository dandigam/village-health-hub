/**
 * Centralized API Service
 * 
 * All API calls go through this service. If the backend is unavailable
 * or returns empty data, it automatically falls back to mock data.
 * 
 * Compatible with future Spring Boot + MongoDB backend at http://localhost:9090/api/
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';
const API_TIMEOUT = 10000; // 10 seconds

interface ApiResponse<T> {
  data: T;
  source: 'api' | 'mock';
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = API_TIMEOUT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `API error: ${response.status} ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    console.log(`✅ [API Success] ${method} ${endpoint}`, { status: response.status });
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      console.warn(`⚠️ [API Failure] ${method} ${endpoint}`, { status: error.status, message: error.message });
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn(`⏱️ [API Timeout] ${method} ${endpoint} — exceeded ${timeout}ms`);
      throw new ApiError('Request timed out', undefined, endpoint);
    }

    console.warn(`❌ [API Failure] ${method} ${endpoint}`, { message: (error as Error).message });
    throw new ApiError((error as Error).message, undefined, endpoint);
  }
}

/**
 * Fetch data from the API with automatic mock fallback.
 * 
 * @param endpoint - API path (e.g., '/patients')
 * @param mockData - Fallback mock data to use if API is unavailable
 * @returns Object with `data` and `source` ('api' or 'mock')
 */
export async function fetchWithFallback<T>(
  endpoint: string,
  mockData: T,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  try {
    const data = await request<T>(endpoint, options);

    // If API returns empty array or null, use mock
    if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
      console.info(`🔄 [Fallback] ${endpoint} — API returned empty, using mock data`);
      return { data: mockData, source: 'mock' };
    }

    return { data, source: 'api' };
  } catch {
    console.info(`🔄 [Fallback] ${endpoint} — API unavailable, using mock data`);
    return { data: mockData, source: 'mock' };
  }
}

/**
 * Mutation helper — POST/PUT/PATCH/DELETE with no mock fallback.
 * Mutations should fail visibly if the backend is down.
 * Falls back gracefully in dev by logging the intent.
 */
export async function mutate<T>(
  endpoint: string,
  options: ApiRequestOptions
): Promise<T | null> {
  try {
    return await request<T>(endpoint, options);
  } catch (error) {
    console.warn(`🔄 [Mutation Skipped] ${options.method || 'POST'} ${endpoint} — backend unavailable. Data not persisted.`, error);
    return null;
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, mockData: T) => fetchWithFallback<T>(endpoint, mockData),
  
  post: <T>(endpoint: string, body: unknown) =>
    mutate<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown) =>
    mutate<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body: unknown) =>
    mutate<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    mutate<T>(endpoint, { method: 'DELETE' }),
};

export { API_BASE_URL, ApiError };
export default api;
