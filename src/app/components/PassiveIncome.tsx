import { useState, useEffect } from 'react';
import { Info, Loader2, Coins, Clock, Zap, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { passiveIncomeApi } from '@/services/api';
import type { PassiveIncomeSettings } from '@/app/types';

export function PassiveIncome() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PassiveIncomeSettings>({
    enabled: false,
    coins_per_interval: 10,
    interval_minutes: 5,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await passiveIncomeApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.warn('Passive income settings not available yet');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Исправление №10: валидация перед сохранением
  const handleSave = async () => {
    // Проверка диапазонов
    if (settings.coins_per_interval < 1 || settings.coins_per_interval > 100) {
      toast.error('Сумма начисления должна быть от 1 до 100 монет');
      return;
    }
    if (settings.interval_minutes < 1 || settings.interval_minutes > 60) {
      toast.error('Интервал должен быть от 1 до 60 минут');
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = await passiveIncomeApi.updateSettings({
        enabled: settings.enabled,
        coins_per_interval: settings.coins_per_interval,
        interval_minutes: settings.interval_minutes,
      });
      setSettings(updatedSettings);
      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Настройки пассивного дохода сохранены!</span>
        </div>
      );
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при сохранении настроек');
    } finally {
      setIsSaving(false);
    }
  };

  // 🔥 Безопасная валидация при вводе
  const handleCoinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      setSettings({ ...settings, coins_per_interval: val });
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 60) {
      setSettings({ ...settings, interval_minutes: val });
    }
  };

  const estimatedPerHour = settings.enabled
    ? Math.floor((60 / settings.interval_minutes) * settings.coins_per_interval)
    : 0;

  const estimatedPerDay = estimatedPerHour * 24;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f0f1a] via-[#13132b] to-[#0a0a1a] border border-gray-800/50 p-6 sm:p-8"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Пассивный доход</h2>
              <p className="text-gray-400 text-sm">Автоматическое начисление монет зрителям</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toggle Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="passive-toggle" className="text-lg font-semibold text-white cursor-pointer">
                  Включить пассивный доход
                </Label>
                <p className="text-gray-400 text-sm mt-1">
                  Зрители будут получать монеты автоматически во время просмотра
                </p>
              </div>
              <Switch
                id="passive-toggle"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                disabled={isSaving}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-purple-600 scale-125"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      <AnimatePresence>
        {settings.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Amount Setting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    Сумма начисления
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Сколько монет получает зритель за интервал
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[settings.coins_per_interval]}
                        onValueChange={([value]) => setSettings({ ...settings, coins_per_interval: value })}
                        min={1}
                        max={100}
                        step={1}
                        disabled={isSaving}
                        className="[&>span]:bg-gradient-to-r [&>span]:from-cyan-500 [&>span]:to-purple-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1 coin</span>
                        <span>100 coins</span>
                      </div>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.coins_per_interval}
                        onChange={handleCoinsChange}
                        className="text-center text-lg font-bold text-gray-900 bg-gray-100 border-gray-300"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interval Setting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Интервал начисления
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Как часто зрители получают монеты
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[settings.interval_minutes]}
                        onValueChange={([value]) => setSettings({ ...settings, interval_minutes: value })}
                        min={1}
                        max={60}
                        step={1}
                        disabled={isSaving}
                        className="[&>span]:bg-gradient-to-r [&>span]:from-cyan-500 [&>span]:to-purple-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1 минута</span>
                        <span>60 минут</span>
                      </div>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.interval_minutes}
                        onChange={handleIntervalChange}
                        className="text-center text-lg font-bold text-gray-900 bg-gray-100 border-gray-300"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-amber-500/5" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-gray-400 text-sm">За час стрима</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    ~{estimatedPerHour}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">монет на зрителя</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-gray-400 text-sm">За 24 часа</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ~{estimatedPerDay}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">монет на зрителя</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Alert className="bg-cyan-500/5 border-cyan-500/30 backdrop-blur-sm">
                <Info className="h-4 w-4 text-cyan-400" />
                <AlertDescription className="text-cyan-300/80">
                  Зрители получают{' '}
                  <span className="font-bold text-cyan-400">{settings.coins_per_interval} монет</span>{' '}
                  каждые{' '}
                  <span className="font-bold text-cyan-400">{settings.interval_minutes} мин</span>{' '}
                  во время стрима
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Как это работает</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Zap className="w-5 h-5 text-yellow-400" />,
                        title: 'Автоматическое начисление',
                        desc: 'Монеты начисляются автоматически, пока стрим активен',
                      },
                      {
                        icon: <Users className="w-5 h-5 text-cyan-400" />,
                        title: 'Всем зрителям',
                        desc: 'Каждый зритель получает монеты за просмотр',
                      },
                      {
                        icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
                        title: 'Стимул смотреть',
                        desc: 'Зрители могут тратить монеты на донаты другим стримерам',
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!settings.enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
            <CardContent className="py-12 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                😴
              </motion.div>
              <p className="text-gray-400 text-lg">Пассивный доход выключен</p>
              <p className="text-gray-500 text-sm mt-1">
                Включите, чтобы зрители получали монеты за просмотр ваших стримов
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleSave}
          className="w-full h-14 text-lg font-medium bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}