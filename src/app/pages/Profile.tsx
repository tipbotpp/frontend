import { User, ArrowUpRight, TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { userApi, balanceApi, donationApi } from '@/services/api';
import type { DonationHistoryItem } from '@/app/types';

function parseDonationHistory(data: unknown): DonationHistoryItem[] {
  if (Array.isArray(data)) return data as DonationHistoryItem[];
  if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: DonationHistoryItem[] }).items;
  }
  return [];
}

export function Profile() {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMe(),
  });

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => balanceApi.get(),
  });

  const isStreamer = user?.role === 'streamer';
  const historyType = isStreamer ? 'received' : 'sent';

  const {
    data: donations = [],
    isLoading: donationsLoading,
    isError: donationsError,
    refetch: refetchDonations,
  } = useQuery({
    queryKey: ['donations', 'history', historyType],
    queryFn: async () => {
      const data = await donationApi.getHistory({ limit: 50, type: historyType });
      return parseDonationHistory(data);
    },
    enabled: Boolean(user),
  });

  const balance = balanceData?.balance ?? 0;
  const isLoading = userLoading || balanceLoading || (Boolean(user) && donationsLoading);

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const donationCount = donations.length;

  const formatDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Доставлен';
      case 'rejected':
        return 'Отклонён';
      case 'processing':
        return 'Обработка';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-500"
        />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-gray-400 mb-4">Не удалось загрузить профиль</p>
          <Button onClick={() => refetchUser()} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <div className="pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-gray-800/50"
        >
          <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-6 relative">
            <div className="flex items-center gap-3 sm:gap-4 mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="relative flex-shrink-0"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20">
                  {(user.display_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 border-2 border-[#0f0f1a]" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {user.display_name || user.username || 'Пользователь'}
                </h1>
                <Badge
                  className={`mt-1.5 text-xs ${
                    isStreamer
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {isStreamer ? 'Стример' : user.role ? 'Зритель' : 'Роль не выбрана'}
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gray-900/60 backdrop-blur-xl border border-gray-800/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Баланс</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {balance.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">coins</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="px-4 sm:px-6 -mt-2 relative z-10">
          <Tabs defaultValue="donations" className="space-y-0">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-lg">
              <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-800/50 p-1.5 rounded-none">
                <TabsTrigger
                  value="donations"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-400 hover:text-gray-200"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {isStreamer ? 'Получено' : 'Донаты'}
                  {donationCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                      {donationCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-400 hover:text-gray-200"
                >
                  <TrendingUp className="w-4 h-4" />
                  Статистика
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="donations" className="space-y-3 mt-0">
                  {donationsError ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm mb-3">Не удалось загрузить историю</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchDonations()}
                        className="border-gray-700 text-gray-300"
                      >
                        Повторить
                      </Button>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {donations.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-10"
                        >
                          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                            <ArrowUpRight className="w-7 h-7 text-gray-600" />
                          </div>
                          <p className="text-gray-400 text-sm">Донатов пока нет</p>
                          <p className="text-gray-600 text-xs mt-1">
                            {isStreamer
                              ? 'Как только зрители отправят донаты, они появятся здесь'
                              : 'Отправьте первый донат стримеру'}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          {donations.map((donation, index) => (
                            <motion.div
                              key={donation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/30 hover:border-indigo-500/20 transition-all duration-300">
                                <CardContent className="p-3 sm:p-4">
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-white text-sm truncate">
                                        {isStreamer
                                          ? donation.from_user?.username || 'Зритель'
                                          : donation.to_streamer?.username || 'Стример'}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {formatDate(donation.created_at)}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p
                                        className={`text-base font-bold ${
                                          isStreamer ? 'text-green-400' : 'text-red-400'
                                        }`}
                                      >
                                        {isStreamer ? `+${donation.amount}` : `-${donation.amount}`}
                                      </p>
                                      <Badge
                                        className={`text-[10px] px-1.5 py-0 ${getStatusColor(donation.status)}`}
                                      >
                                        {getStatusText(donation.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                  {donation.message && (
                                    <div className="mt-1.5 p-2 bg-gray-900/40 rounded-lg">
                                      <p className="text-xs text-gray-400 italic leading-relaxed">
                                        &ldquo;{donation.message}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </TabsContent>

                <TabsContent value="stats" className="space-y-3 mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                      <CardContent className="p-4 sm:p-5 relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isStreamer ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}
                          >
                            <ArrowUpRight
                              className={`w-4 h-4 ${isStreamer ? 'text-green-400' : 'text-red-400'}`}
                            />
                          </div>
                          <span className="text-gray-500 text-xs sm:text-sm">
                            {isStreamer ? 'Получено' : 'Отправлено'}
                          </span>
                        </div>
                        <p
                          className={`text-2xl sm:text-3xl font-bold ${isStreamer ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {totalDonations.toLocaleString()}
                          <span
                            className={`text-xs font-normal ml-1 ${
                              isStreamer ? 'text-green-500/70' : 'text-red-500/70'
                            }`}
                          >
                            coins
                          </span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                      <CardContent className="p-4 sm:p-5 relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-gray-500 text-xs sm:text-sm">Операций</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400">{donationCount}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/30 sm:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-base flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400" />
                          Профиль
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-2">
                          {[
                            { label: 'ID', value: user.id },
                            { label: 'Telegram ID', value: user.telegram_id },
                            { label: 'Username', value: user.username || '—' },
                            {
                              label: 'Роль',
                              value: isStreamer ? 'Стример' : user.role ? 'Зритель' : '—',
                            },
                            {
                              label: 'Регистрация',
                              value: user.created_at ? formatDate(user.created_at) : '—',
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="flex justify-between items-center py-1.5 border-b border-gray-700/30 last:border-0"
                            >
                              <span className="text-gray-500 text-xs sm:text-sm">{item.label}</span>
                              <span className="text-gray-300 text-xs sm:text-sm font-medium text-right ml-2">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Profile;
