import { useState, useEffect } from 'react';
import { User, Settings, ArrowUpRight, ArrowDownRight, TrendingUp, Clock, RefreshCcw, Copy, Check, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { userApi, balanceApi, donationApi } from '../../services/api';
import type { User as UserType, DonationHistoryItem } from '../types';

export function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [balance, setBalance] = useState(0);
  const [donations, setDonations] = useState<DonationHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [userData, balanceData, donationsData] = await Promise.all([
        userApi.getMe(),
        balanceApi.get(),
        donationApi.getHistory({ limit: 20 }).catch(() => ({ items: [], total: 0, limit: 20, offset: 0 })),
      ]);
      
      setUser(userData);
      setBalance(balanceData.balance);
      setDonations(donationsData.items || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (user) {
      navigator.clipboard.writeText(String(user.id));
      setCopied(true);
      toast.success('ID скопирован');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchRole = async () => {
    try {
      const newRole = user?.role === 'streamer' ? 'viewer' : 'streamer';
      const updatedUser = await userApi.setRole(newRole);
      setUser(updatedUser);
      if (updatedUser.balance) {
        setBalance(updatedUser.balance);
      }
      toast.success(`Роль изменена на "${newRole === 'streamer' ? 'Стример' : 'Зритель'}"`);
    } catch (error: any) {
      toast.error(error?.message || 'Не удалось изменить роль');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Доставлен';
      case 'rejected': return 'Отклонён';
      case 'processing': return 'В обработке';
      default: return status;
    }
  };

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const donationCount = donations.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-500"
          />
          <p className="text-gray-400">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden pb-6">
      {/* Анимированный фон */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0f0f1a] via-[#13132b] to-[#0a0a1a] border-b border-gray-800/50"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          </div>

          <div className="px-6 pt-10 pb-8 relative">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-indigo-500/50">
                  {(user?.display_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </motion.div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  {user?.display_name || user?.username || 'Пользователь'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${
                    user?.role === 'streamer' 
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {user?.role === 'streamer' ? '🎥 Стример' : '👀 Зритель'}
                  </Badge>
                  <button
                    onClick={handleCopyId}
                    className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center gap-1"
                  >
                    ID: {user?.id}
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Текущий баланс</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {balance}
                    </p>
                    <p className="text-gray-500 text-lg">coins</p>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Switch Role */}
        <div className="px-6 -mt-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Переключить роль</p>
                    <p className="text-gray-400 text-sm">
                      {user?.role === 'streamer' 
                        ? 'Перейти в режим зрителя для отправки донатов'
                        : 'Перейти в режим стримера для управления стримом'}
                    </p>
                  </div>
                  <Button
                    onClick={handleSwitchRole}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    {user?.role === 'streamer' ? 'Стать зрителем' : 'Стать стримером'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs defaultValue="donations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-1.5">
              <TabsTrigger
                value="donations"
                className="gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Донаты ({donationCount})</span>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Статистика</span>
              </TabsTrigger>
            </TabsList>

            {/* Donations Tab */}
            <TabsContent value="donations" className="space-y-4">
              <AnimatePresence>
                {donations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-5xl mb-4">💝</div>
                    <p className="text-gray-400 text-lg">Донаты отсутствуют</p>
                    <p className="text-gray-500 text-sm mt-1">Отправьте первый донат любимому стримеру!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {donations.map((donation, index) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/30 hover:border-indigo-500/30 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">
                                  {donation.from_user.username || 'Аноним'} → {donation.to_streamer.username || 'Стример'}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {formatDate(donation.created_at)}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                                  -{donation.amount} coins
                                </p>
                                <Badge className={getStatusColor(donation.status)}>
                                  {getStatusText(donation.status)}
                                </Badge>
                              </div>
                            </div>
                            {donation.message && (
                              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                                <p className="text-sm text-gray-300 italic">
                                  "{donation.message}"
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-gray-400">Всего отправлено</span>
                      </div>
                      <p className="text-3xl font-bold text-red-400">
                        {totalDonations} <span className="text-sm text-red-500">coins</span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400">Количество донатов</span>
                      </div>
                      <p className="text-3xl font-bold text-green-400">
                        {donationCount}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="sm:col-span-2"
                >
                  <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        Информация о профиле
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { label: 'ID пользователя', value: String(user?.id) },
                          { label: 'Telegram ID', value: String(user?.telegram_id) },
                          { label: 'Роль', value: user?.role === 'streamer' ? 'Стример' : 'Зритель' },
                          { label: 'Дата регистрации', value: user?.created_at ? formatDate(user.created_at) : '—' },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="text-white font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}