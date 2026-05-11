import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { userApi, donationApi, balanceApi, stopWordsApi, alertApi } from '../../services/api';
import type { StreamerProfile, AlertSettings, StopWord } from '../types';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export function StreamerPage() {
  const { streamerId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'toxic'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [streamer, setStreamer] = useState<StreamerProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [stopWords, setStopWords] = useState<StopWord[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🔥 Безопасное получение ID
  const numericId = streamerId ? Number(streamerId) : NaN;

    useEffect(() => {
      console.log('[StreamerPage] mounted, streamerId:', streamerId);
      
      if (!streamerId) {
        console.error('[StreamerPage] No streamerId in URL');
        setIsLoading(false);
        setErrorMessage('ID стримера не указан');
        return;
      }
      
  const id = Number(streamerId);
  console.log('[StreamerPage] numericId:', id, 'isNaN:', isNaN(id));
  
  if (isNaN(id) || id <= 0) {
    console.error('[StreamerPage] Invalid streamerId:', streamerId);
    setIsLoading(false);
    setErrorMessage('Неверный ID стримера');
    return;
  }
  
  loadData();
}, [streamerId]);
  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [streamerData, balanceData, stopWordsData, alertData] = await Promise.all([
        userApi.getUserById(numericId),
        balanceApi.get(),
        stopWordsApi.getAll().catch(() => []),
        alertApi.getSettings().catch(() => null),
      ]);

      setStreamer(streamerData);
      setBalance(balanceData.balance);
      setStopWords(Array.isArray(stopWordsData) ? stopWordsData : []);
      setAlertSettings(alertData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setErrorMessage(
        error?.response?.status === 404
          ? 'Стример не найден'
          : 'Не удалось загрузить данные стримера'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkStopWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return (stopWords || []).some((stopWord) =>
      lowerText.includes(stopWord.word.toLowerCase())
    );
  };

  const handleSendDonation = async () => {
    const donationAmount = amount || Number(customAmount);

    if (donationAmount <= 0) {
      toast.error('Выберите сумму доната');
      return;
    }

    if (donationAmount > balance) {
      setStatus('error');
      toast.error('Недостаточно средств на балансе');
      return;
    }

    if (message && checkStopWords(message)) {
      setStatus('toxic');
      toast.error('Ваше сообщение содержит запрещённые слова');
      return;
    }

    setIsSending(true);
    try {
      await donationApi.send({
        streamer_id: numericId,
        amount: donationAmount,
        message: message || undefined,
      });

      const newBalance = await balanceApi.get();
      setBalance(newBalance.balance);

      setStatus('success');
      toast.success(`Донат ${donationAmount} coins успешно отправлен!`);

      setTimeout(() => {
        setStatus('idle');
        setAmount(null);
        setCustomAmount('');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Failed to send donation:', error);

      // 🔥 Обработка ошибок от API
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.status === 451) {
        setStatus('toxic');
        toast.error('Сообщение отклонено модерацией');
      } else if (error?.response?.status === 400) {
        setStatus('error');
        toast.error('Недостаточно средств или стрим не активен');
      } else {
        setStatus('error');
        toast.error('Ошибка при отправке доната');
      }
    } finally {
      setIsSending(false);
    }
  };

  const selectedAmount = amount || Number(customAmount) || 0;
  const characterCount = message.length;
  const maxCharacters = 200;

  // 🔥 Экран ошибки загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // 🔥 Экран ошибки
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-xl text-gray-400 mb-2">{errorMessage}</p>
          <p className="text-gray-500 text-sm mb-6">
            {isNaN(numericId)
              ? 'Некорректный ID в URL'
              : 'Возможно, стример не существует или удалён'}
          </p>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  // 🔥 Стример не найден (запасной вариант)
  if (!streamer) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Стример не найден</p>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  const previewSettings = alertSettings || {
    bg_color: '#6366f1',
    text_color: '#ffffff',
    font: 'Arial',
    duration_sec: 5,
    image_enabled: false,
    tts_enabled: false,
    tts_voice: 'default',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <p className="font-medium text-sm sm:text-base">Донат стримеру</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 -mt-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-shrink-0">
              <img
                src={streamer.avatar_url || '/default-avatar.png'}
                alt={streamer.display_name || streamer.username || 'Streamer'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-purple-500/50"
              />
              {streamer.is_live && (
                <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-white border-2 border-gray-900 text-xs">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                {streamer.display_name || streamer.username || 'Аноним'}
              </h1>
              <p className="text-gray-400 text-sm">{streamer.description || 'Стример'}</p>
            </div>
          </div>

          {streamer.goal && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-3 sm:p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-300 text-sm">
                  🎯 {streamer.goal.title || 'Цель'}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-purple-400">
                  {Math.round((streamer.goal.current_amount / streamer.goal.target_amount) * 100)}%
                </p>
              </div>
              <Progress
                value={(streamer.goal.current_amount / streamer.goal.target_amount) * 100}
                className="h-2 sm:h-3 mb-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
              />
              <p className="text-xs sm:text-sm text-gray-400 text-right">
                {streamer.goal.current_amount} / {streamer.goal.target_amount} coins
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6">
          <h2 className="font-semibold text-white mb-4">Выберите сумму</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? 'default' : 'outline'}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount('');
                }}
                className={`h-14 sm:h-16 text-sm sm:text-base ${
                  amount === preset
                    ? 'bg-purple-600 hover:bg-purple-700 border-0'
                    : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
                disabled={isSending}
              >
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold">{preset}</div>
                  <div className="text-[10px] sm:text-xs">coins</div>
                </div>
              </Button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Своя сумма"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(null);
            }}
            className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            min="1"
            disabled={isSending}
          />
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-white text-sm sm:text-base">Ваше сообщение (необязательно)</h2>
            <span className={`text-xs sm:text-sm ${characterCount > maxCharacters ? 'text-red-400' : 'text-gray-500'}`}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
          <Textarea
            placeholder="Напишите сообщение стримеру..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-20 sm:min-h-24 resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 text-sm"
            maxLength={maxCharacters}
            disabled={isSending}
          />
        </div>

        {(selectedAmount > 0 || message) && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6">
            <h2 className="font-semibold text-white mb-4">Предпросмотр алерта</h2>
            <div
              className="rounded-xl p-4 sm:p-6 text-center shadow-2xl"
              style={{
                backgroundColor: previewSettings.bg_color,
                color: previewSettings.text_color,
                fontFamily: previewSettings.font,
              }}
            >
              <p className="text-lg sm:text-2xl font-bold mb-2 opacity-90">Вы</p>
              <p className="text-3xl sm:text-5xl font-bold mb-3">{selectedAmount} coins</p>
              {message && <p className="text-base sm:text-xl opacity-90">"{message}"</p>}
            </div>
          </div>
        )}

        {status === 'success' && (
          <Alert className="bg-green-500/10 border-green-500/30 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300 text-sm">
              Донат успешно отправлен! Ожидайте реакцию стримера.
            </AlertDescription>
          </Alert>
        )}

        {status === 'toxic' && (
          <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 text-sm">
              Ваше сообщение нарушает правила и было отклонено.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="bg-yellow-500/10 border-yellow-500/30 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300 text-sm">
              Недостаточно средств на балансе.
            </AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg shadow-purple-500/20"
          onClick={handleSendDonation}
          disabled={selectedAmount <= 0 || status !== 'idle' || isSending}
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {isSending ? 'Отправка...' : 'Отправить донат'}
        </Button>

        <p className="text-xs sm:text-sm text-gray-500 text-center">
          Ваш баланс: <span className="text-purple-400 font-medium">{balance.toLocaleString()} coins</span>
        </p>
      </div>
    </div>
  );
}
export default StreamerPage;
