import { http } from '@/services/http';
import type { SessionStats, StreamStartResponse, StreamStopResponse, StreamStatusResponse } from '@/app/types';

export const streamApi = {

  async start(): Promise<StreamStartResponse> {
    return http.post('/stream/start', {}); 
  },
  
  async stop(): Promise<StreamStopResponse> {
    return http.post('/stream/stop', {});
  },
  
  async getStatus(): Promise<StreamStatusResponse> {
    return http.get('/stream/status');
  },
};

export const donationApi = {
  async getSessionStats(): Promise<SessionStats> {
    return http.get('/donations/session');
  },
};