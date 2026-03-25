import React, { useState } from 'react';
import { Power, Copy, Check, ExternalLink, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { mockSession, mockSessionEarnings } from '../mock-data';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function Dashboard() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [copied, setCopied] = useState(false);

  const widgetUrl = `https://donate.app/widget/${mockSession.streamerId}`;

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    toast.success('Ссылка скопирована в буфер обмена!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      toast.success('Стрим запущен!');
    } else {
      toast.info('Стрим завершён');
    }
  };

  const formatDuration = () => {
    const now = new Date();
    const diff = now.getTime() - mockSession.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard Стримера</h1>
        <p className="text-green-100">Управление стримом</p>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Stream Control */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Статус стрима</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Текущий статус</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                  <p className="text-xl font-bold">
                    {isStreaming ? 'В ЭФИРЕ' : 'Офлайн'}
                  </p>
                </div>
                {isStreaming && (
                  <p className="text-sm text-gray-600 mt-1">
                    Время в эфире: {formatDuration()}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                variant={isStreaming ? 'destructive' : 'default'}
                onClick={handleToggleStream}
                className="gap-2"
              >
                <Power className="w-5 h-5" />
                {isStreaming ? 'Завершить' : 'Начать'}
              </Button>
            </div>

            {/* Widget URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ссылка на виджет для OBS</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={widgetUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 border rounded-lg text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWidget}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(widgetUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Собрано за сессию</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {mockSession.totalEarned} ₽
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Количество донатов</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {mockSession.donationCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Топ донатер</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold truncate">{mockSession.topDonor?.name}</p>
              <p className="text-xl font-bold text-purple-600">
                {mockSession.topDonor?.amount} ₽
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>График поступлений</CardTitle>
            <CardDescription>Доходы за текущую сессию</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSessionEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Последние донаты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { user: 'mega_donor', amount: 1000, message: 'Отличный контент!' },
                { user: 'viewer_alex', amount: 500, message: 'Красивая игра!' },
                { user: 'fan_123', amount: 250, message: 'Продолжай!' },
              ].map((donation, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {donation.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{donation.user}</p>
                      <p className="font-bold text-green-600">{donation.amount} ₽</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{donation.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}