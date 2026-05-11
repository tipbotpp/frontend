import { http } from '@/services/http';
import type { WidgetConfig } from '@/shared/contracts/widget.contract';

export const widgetApi = {
  async getConfig(streamToken: string): Promise<WidgetConfig> {
    return http.get(`/widget/${streamToken}`);
  },
};