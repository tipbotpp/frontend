import { useState, useEffect } from 'react';
import { Play, Loader2, Palette, Type, Clock, Eye, Sparkles, Volume2, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { alertApi } from '../../services/api';
import { userApi } from '../../services/api';
import type { AlertSettings, User } from '../types';

const FONTS = ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Times New Roman', 'Verdana', 'Georgia', 'Trebuchet MS'];
const TTS_VOICES = ['default', 'male', 'female', 'robot', 'whisper'];
const PRESET_THEMES = [
  { name: 'Классика', bg: '#6366f1', text: '#ffffff', font: 'Arial' },
  { name: 'Киберпанк', bg: '#0a0a0f', text: '#00ffff', font: 'Courier New' },
  { name: 'Неон', bg: '#1a0033', text: '#ff00ff', font: 'Impact' },
  { name: 'Минимализм', bg: '#ffffff', text: '#000000', font: 'Georgia' },
  { name: 'Закат', bg: '#ff6b35', text: '#ffffff', font: 'Verdana' },
];

export function AlertCustomizer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AlertSettings>({
    bg_color: '#6366f1',
    text_color: '#ffffff',
    font: 'Arial',
    duration_sec: 5,
    image_enabled: false,
    tts_enabled: false,
    tts_voice: 'default',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewDonation] = useState({ amount: 500, message: 'Спасибо за стрим!' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userData, alertSettings] = await Promise.all([
        userApi.getMe(),
        alertApi.getSettings().catch(() => null),
      ]);

      setUser(userData);
      if (alertSettings) {
        setSettings(alertSettings);
      }
    } catch (error) {
      console.warn('Alert settings not available yet');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Исправление №8: отправка тестового алерта в OBS
  const handleTestAlert = async () => {
    setShowPreview(true);

    try {
      await alertApi.sendTest();
      toast.success('Тестовый алерт отправлен в OBS');
    } catch (error: any) {
      toast.error(
        error?.message || 'Не удалось отправить тестовый алерт. Стрим должен быть активен.'
      );
    }

    setTimeout(() => setShowPreview(false), settings.duration_sec * 1000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = await alertApi.updateSettings({
        bg_color: settings.bg_color,
        text_color: settings.text_color,
        font: settings.font,
        duration_sec: settings.duration_sec,
        image_enabled: settings.image_enabled,
        tts_enabled: settings.tts_enabled,
        tts_voice: settings.tts_voice,
      });
      setSettings(updatedSettings);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Настройки алертов сохранены!</span>
        </div>
      );
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при сохранении настроек');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: (typeof PRESET_THEMES)[0]) => {
    setSettings({
      ...settings,
      bg_color: preset.bg,
      text_color: preset.text,
      font: preset.font,
    });
    toast.success(`Тема "${preset.name}" применена`);
  };

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
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Конструктор алертов</h2>
              <p className="text-gray-400 text-sm">Настройка уведомлений о донатах на стриме</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preset Themes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Готовые темы
            </CardTitle>
            <CardDescription className="text-gray-400">
              Выберите пресет для быстрой настройки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PRESET_THEMES.map((preset) => (
                <motion.button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-3 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: preset.bg, color: preset.text }}
                  >
                    Alert
                  </div>
                  <p className="text-white text-sm text-center group-hover:text-purple-400 transition-colors">
                    {preset.name}
                  </p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Color Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Цвета
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.bg_color }} />
                Цвет фона
              </Label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.bg_color}
                  onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                  className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-700 hover:border-purple-500/50 transition-colors"
                />
                <Input
                  type="text"
                  value={settings.bg_color}
                  onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                  className="flex-1 h-16 text-lg font-mono bg-gray-800 border-gray-700 text-white"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.text_color }} />
                Цвет текста
              </Label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.text_color}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-700 hover:border-purple-500/50 transition-colors"
                />
                <Input
                  type="text"
                  value={settings.text_color}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="flex-1 h-16 text-lg font-mono bg-gray-800 border-gray-700 text-white"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Font & Duration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-cyan-400" />
              Шрифт и время
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-gray-300">Шрифт</Label>
              <Select value={settings.font} onValueChange={(value) => setSettings({ ...settings, font: value })}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {FONTS.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: f }} className="text-white hover:bg-gray-700">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Длительность показа
                </Label>
                <span className="text-cyan-400 font-bold text-lg">{settings.duration_sec} сек</span>
              </div>
              <Slider
                value={[settings.duration_sec]}
                onValueChange={([value]) => setSettings({ ...settings, duration_sec: value })}
                min={3}
                max={15}
                step={1}
                disabled={isSaving}
                className="[&>span]:bg-gradient-to-r [&>span]:from-cyan-500 [&>span]:to-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>3 сек</span>
                <span>15 сек</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TTS & Image Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-yellow-400" />
              Дополнительно
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Озвучка (TTS)</p>
                  <p className="text-sm text-gray-400">Робот зачитает сообщение вслух</p>
                </div>
              </div>
              <Switch
                checked={settings.tts_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, tts_enabled: checked })}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-amber-600"
              />
            </div>

            <AnimatePresence>
              {settings.tts_enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-gray-300">Голос озвучки</Label>
                  <Select
                    value={settings.tts_voice}
                    onValueChange={(value) => setSettings({ ...settings, tts_voice: value })}
                  >
                    <SelectTrigger className="h-12 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {TTS_VOICES.map((voice) => (
                        <SelectItem key={voice} value={voice} className="text-white hover:bg-gray-700 capitalize">
                          {voice === 'default'
                            ? 'Стандартный'
                            : voice === 'male'
                              ? 'Мужской'
                              : voice === 'female'
                                ? 'Женский'
                                : voice === 'robot'
                                  ? 'Робот'
                                  : 'Шёпот'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="text-white font-medium">Картинка донатера</p>
                  <p className="text-sm text-gray-400">Показывать аватар отправителя</p>
                </div>
              </div>
              <Switch
                checked={settings.image_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, image_enabled: checked })}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-600"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Предпросмотр
            </CardTitle>
            <CardDescription className="text-gray-400">
              Так алерт будет выглядеть на стриме
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-950 rounded-xl overflow-hidden relative border border-gray-800">
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      backgroundColor: settings.bg_color,
                      color: settings.text_color,
                      fontFamily: settings.font,
                      padding: '2.5rem',
                      borderRadius: '1.5rem',
                      minWidth: '280px',
                      textAlign: 'center',
                      boxShadow: `0 0 60px ${settings.bg_color}40, 0 20px 40px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {settings.image_enabled && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-2xl"
                      >
                        {user?.display_name?.[0] || 'U'}
                      </motion.div>
                    )}
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold mb-2 opacity-90"
                    >
                      {user?.display_name || user?.username || 'Зритель'}
                    </motion.p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                      className="text-5xl font-bold mb-3"
                    >
                      {previewDonation.amount} coins
                    </motion.p>
                    <motion.p
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-lg opacity-90"
                    >
                      {previewDonation.message}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showPreview && (
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl mb-4"
                    >
                      🎬
                    </motion.div>
                    <p className="text-gray-400 text-lg mb-2">Нажмите "Тест" для предпросмотра</p>
                    <p className="text-gray-500 text-sm">
                      Алерт отобразится на {settings.duration_sec} секунд
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleTestAlert}
                className="flex-1 h-12 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                <Play className="w-4 h-4 mr-2" />
                Тест алерта
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="h-12 border-gray-700 text-gray-400 hover:bg-gray-800"
              >
                Сброс
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={handleSave}
          className="w-full h-14 text-lg font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}