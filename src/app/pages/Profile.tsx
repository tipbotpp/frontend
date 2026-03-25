import React from 'react';
import { mockUser, mockDonations, mockTransactions } from '../mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Clock } from 'lucide-react';

export function Profile() {
  const [currentRole, setCurrentRole] = React.useState(mockUser.role);

  const handleToggleRole = () => {
    const newRole = currentRole === 'viewer' ? 'streamer' : 'viewer';
    setCurrentRole(newRole);
    mockUser.role = newRole;
    // Перезагрузка страницы для обновления навигации
    window.location.reload();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'Выполнено';
      case 'rejected':
        return 'Отклонено';
      case 'failed':
        return 'Ошибка';
      case 'pending':
        return 'В обработке';
      default:
        return status;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'donation_sent':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'donation_received':
        return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'passive_income':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-8">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={mockUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={mockUser.username}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold">{mockUser.username}</h1>
            <Badge className="mt-1 bg-white/20 text-white border-0">
              {mockUser.role === 'streamer' ? 'Стример' : 'Зритель'}
            </Badge>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-1">Текущий баланс</p>
          <p className="text-3xl font-bold">{mockUser.balance} ₽</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4">
        {/* Demo Info Card */}
        <Card className="shadow-lg mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">🎭 Демо-режим:</span> Переключите роль, чтобы увидеть интерфейс {currentRole === 'viewer' ? 'стримера' : 'зрителя'}
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg">
            <TabsTrigger value="donations">Мои донаты</TabsTrigger>
            <TabsTrigger value="transactions">История</TabsTrigger>
          </TabsList>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>История донатов</CardTitle>
              </CardHeader>
              <CardContent>
                {mockDonations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Донаты отсутствуют</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              Для {donation.streamerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(donation.timestamp)}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-red-600">
                              -{donation.amount} ₽
                            </p>
                            <Badge className={getStatusColor(donation.status)}>
                              {getStatusText(donation.status)}
                            </Badge>
                          </div>
                        </div>
                        {donation.message && (
                          <p className="text-sm text-gray-700 bg-white p-2 rounded mt-2">
                            "{donation.message}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600 mb-1">Всего отправлено</p>
                  <p className="text-2xl font-bold text-red-600">
                    {mockDonations
                      .filter(d => d.status === 'success')
                      .reduce((sum, d) => sum + d.amount, 0)} ₽
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600 mb-1">Количество</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockDonations.filter(d => d.status === 'success').length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>История начислений</CardTitle>
              </CardHeader>
              <CardContent>
                {mockTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Транзакции отсутствуют</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mockTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.timestamp)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.amount > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount} ₽
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusText(transaction.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Toggle Role Button */}
      <div className="px-6 mt-4">
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleToggleRole}
        >
          Переключиться на {currentRole === 'viewer' ? 'стримера' : 'зрителя'}
        </Button>
      </div>
    </div>
  );
}