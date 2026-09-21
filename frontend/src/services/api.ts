import type {
  FullVerificationResponse,
  StreamStageEvent,
  AnalyticsStats,
} from '../types';
import { authService } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const apiService = {
  getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async streamVerification(
    inputType: 'claim' | 'article' | 'url',
    content: string,
    onEvent: (event: StreamStageEvent) => void
  ): Promise<FullVerificationResponse> {
    const response = await fetch(`${API_BASE}/verify/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        input_type: inputType,
        content: content.trim(),
        is_demo: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Verification request failed.' }));
      throw new Error(err.detail || 'Verification request failed.');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported by browser.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalResult: FullVerificationResponse | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const rawJson = line.slice(6).trim();
            if (!rawJson) continue;
            const parsedEvent: StreamStageEvent = JSON.parse(rawJson);
            onEvent(parsedEvent);

            if (parsedEvent.stage === 'COMPLETE' && parsedEvent.data) {
              finalResult = parsedEvent.data as FullVerificationResponse;
            } else if (parsedEvent.stage === 'ERROR') {
              throw new Error(parsedEvent.message || 'Verification failed on server.');
            }
          } catch (e: any) {
            if (e.message && e.message.includes('Verification failed')) {
              throw e;
            }
            console.warn('Could not parse SSE event chunk:', e);
          }
        }
      }
    }

    if (!finalResult) {
      throw new Error('Verification stream ended without completion payload.');
    }

    return finalResult;
  },

  async verifyDirect(
    inputType: 'claim' | 'article' | 'url',
    content: string
  ): Promise<FullVerificationResponse> {
    const res = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        input_type: inputType,
        content: content.trim(),
        is_demo: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed.' }));
      throw new Error(err.detail || 'Failed to verify content.');
    }

    return res.json();
  },

  async getDemoExample(exampleId: string): Promise<FullVerificationResponse> {
    const res = await fetch(`${API_BASE}/verify/demo/${exampleId}`);
    if (!res.ok) {
      throw new Error('Failed to load demo example.');
    }
    return res.json();
  },

  async getHistory(q?: string, verdict?: string): Promise<FullVerificationResponse[]> {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (verdict && verdict !== 'ALL') params.set('verdict', verdict);

    const res = await fetch(`${API_BASE}/history?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to load verification history.');
    }
    return res.json();
  },

  async getAnalyticsStats(): Promise<AnalyticsStats> {
    const res = await fetch(`${API_BASE}/history/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to load analytics statistics.');
    }
    return res.json();
  },
};
