import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, TrendingUp, Zap, Users, Radio, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { balanceApi, userApi } from '../../services/api';
import type { StreamerItem, User } from '../types';

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [streamers, setStreamers] = useState<StreamerItem[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userData, balanceData] = await Promise.all([
        userApi.getMe(),
        balanceApi.get(),
      ]);
      
      setUser(userData);
      setBalance(balanceData.balance);
      
      try {
        const streamersData = await userApi.getStreamers({ limit: 50 });
        setStreamers(streamersData.items);
      } catch (err) {
        console.warn('Streamers endpoint not available yet');
        setStreamers([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStreamers = streamers.filter(streamer =>
    (streamer.display_name || streamer.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeposit = async (amount: number) => {
    try {
      const response = await balanceApi.topup(amount);
      setBalance(response.new_balance);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Баланс пополнен на {amount} coins!</span>
        </div>
      );
      setDepositDialogOpen(false);
      setDepositAmount('');
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при пополнении баланса');
    }
  };

  const handleCustomDeposit = () => {
    const amount = Number(depositAmount);
    if (amount > 0) {
      handleDeposit(amount);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-500"
          />
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-[#0f0f1a] via-[#13132b] to-[#0a0a1a] border-b border-gray-800/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Декоративные линии */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          </div>
          
          <div className="px-6 pt-10 pb-8 relative">
            <div className="mb-6">
              <motion.p 
                className="text-cyan-400/80 text-sm mb-2 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Zap className="w-4 h-4" />
                Добро пожаловать
              </motion.p>
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {user?.display_name || user?.username || 'Гость'}
              </motion.h1>
            </div>
            
            {/* Balance Card */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Ваш баланс</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {balance.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">coins</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setDepositDialogOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  Пополнить
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div> {/* 🔥 ЗАКРЫВАЮЩИЙ ТЕГ ДОБАВЛЕН ЗДЕСЬ */}

        {/* Search */}
        <div className="px-6 -mt-5 mb-6 relative z-20">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Поиск стримеров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
              />
            </div>
          </motion.div>
        </div>

        {/* Live Indicator */}
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400" />
              Активные стримеры
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <span className="text-red-400 text-sm font-medium">LIVE</span>
              <span className="text-gray-500 text-sm">{filteredStreamers.length}</span>
            </div>
          </div>
        </div>

        {/* Streamers List */}
        <div className="px-6 pb-6">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredStreamers.map((streamer, index) => (
                <motion.div
                  key={streamer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden group-hover:border-gray-600/50 transition-all duration-300">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={streamer.avatar_url || '/default-avatar.png'}
                            alt={streamer.display_name || streamer.username || 'Streamer'}
                            className="w-16 h-16 rounded-full ring-2 ring-gray-700 group-hover:ring-cyan-500/50 transition-all duration-300"
                          />
                          {streamer.is_live && (
                            <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-white px-2 py-0.5 text-xs border-2 border-gray-900 animate-pulse">
                              LIVE
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {streamer.display_name || streamer.username || 'Аноним'}
                            </h3>
                            {streamer.is_live && (
                              <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate mb-3">Стример</p>
                          
                          {streamer.goal && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500">{streamer.goal.title || 'Цель'}</span>
                                <span className="text-cyan-400 font-medium">
                                  {streamer.goal.current_amount}/{streamer.goal.target_amount}
                                </span>
                              </div>
                              <Progress 
                                value={(streamer.goal.current_amount / streamer.goal.target_amount) * 100} 
                                className="h-1.5 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-purple-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4"
                      >
                        <Button
                          className="w-full h-12 text-base font-medium bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
                          onClick={() => {
                            const streamerId = streamer.telegram_id || streamer.id;
                            console.log('[Home] Navigating to streamer:', streamerId, streamer);
                            if (streamerId) {
                              navigate(`/streamer/${streamerId}`);
                            } else {
                              toast.error('Не удалось открыть профиль стримера');
                            }
                          }}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Сделать донат
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredStreamers.length === 0 && searchQuery && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg">Стримеры не найдены</p>
              <p className="text-gray-600 text-sm mt-1">Попробуйте изменить поисковый запрос</p>
            </motion.div>
          )}

          {filteredStreamers.length === 0 && !searchQuery && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-gray-400 text-lg">Нет активных стримеров</p>
              <p className="text-gray-600 text-sm mt-1">Загляните позже или станьте первым стримером!</p>
            </motion.div>
          )}
        </div>

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent className="bg-gray-900 border border-gray-700/50 backdrop-blur-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Пополнить баланс
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { amount: 100, icon: '💎' },
                  { amount: 500, icon: '🌟' },
                  { amount: 1000, icon: '👑' },
                ].map(({ amount, icon }) => (
                  <motion.button
                    key={amount}
                    onClick={() => handleDeposit(amount)}
                    className="h-20 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800 transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">+{amount}</div>
                      <div className="text-xs text-gray-500">coins</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur" />
                <div className="relative flex gap-2">
                  <Input
                    type="number"
                    placeholder="Своя сумма"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    className="flex-1 h-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50"
                  />
                  <Button
                    onClick={handleCustomDeposit}
                    disabled={!depositAmount || Number(depositAmount) <= 0}
                    className="h-12 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border-0"
                  >
                    Пополнить
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default Home;