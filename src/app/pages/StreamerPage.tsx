import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { mockStreamers, mockUser } from '../mock-data';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export function StreamerPage() {
  const { streamerId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'toxic'>('idle');

  const streamer = mockStreamers.find(s => s.id === streamerId);

  if (!streamer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Стример не найден</p>
      </div>
    );
  }

  const handleSendDonation = () => {
    const donationAmount = amount || Number(customAmount);

    // Check balance
    if (donationAmount > mockUser.balance) {
      setStatus('error');
      toast.error('Недостаточно средств на балансе');
      return;
    }

    // Check for stop words
    const hasStopWords = streamer.stopWords.some(word =>
      message.toLowerCase().includes(word.toLowerCase())
    );

    if (hasStopWords) {
      setStatus('toxic');
      toast.error('Ваше сообщение содержит запрещённые слова');
      return;
    }

    // Success
    setStatus('success');
    toast.success(`Донат ${donationAmount} ₽ успешно отправлен!`);
    setTimeout(() => {
      setStatus('idle');
      setAmount(null);
      setCustomAmount('');
      setMessage('');
    }, 3000);
  };

  const selectedAmount = amount || Number(customAmount) || 0;
  const characterCount = message.length;
  const maxCharacters = 200;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Streamer Info */}
      <div className="px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <img
                src={streamer.avatar}
                alt={streamer.username}
                className="w-20 h-20 rounded-full"
              />
              {streamer.isLive && (
                <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-white">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{streamer.username}</h1>
              <p className="text-gray-600">{streamer.description}</p>
            </div>
          </div>

          {/* Goal Progress */}
          {streamer.goal && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-700">🎯 {streamer.goal.description}</p>
                <p className="text-sm font-semibold text-blue-600">
                  {Math.round((streamer.goal.current / streamer.goal.target) * 100)}%
                </p>
              </div>
              <Progress
                value={(streamer.goal.current / streamer.goal.target) * 100}
                className="h-3 mb-2"
              />
              <p className="text-sm text-gray-600 text-right">
                {streamer.goal.current} / {streamer.goal.target} ₽
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Donation Form */}
      <div className="px-6 py-6 space-y-6">
        {/* Amount Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Выберите сумму</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? 'default' : 'outline'}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount('');
                }}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{preset}</div>
                  <div className="text-xs">₽</div>
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
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Ваше сообщение</h2>
            <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
          <Textarea
            placeholder="Напишите сообщение стримеру..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24 resize-none"
            maxLength={maxCharacters}
          />
        </div>

        {/* Preview */}
        {(selectedAmount > 0 || message) && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Предпросмотр алерта</h2>
            <div
              className="rounded-lg p-4 text-center"
              style={{
                backgroundColor: streamer.alertSettings.backgroundColor,
                color: streamer.alertSettings.textColor,
                fontFamily: streamer.alertSettings.font
              }}
            >
              <p className="text-2xl font-bold mb-2">{mockUser.username}</p>
              <p className="text-4xl font-bold mb-2">{selectedAmount} ₽</p>
              {message && <p className="text-lg">{message}</p>}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Донат успешно отправлен! Ожидайте реакцию стримера.
            </AlertDescription>
          </Alert>
        )}

        {status === 'toxic' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Ваше сообщение нарушает правила и было отклонено.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Недостаточно средств на балансе.
            </AlertDescription>
          </Alert>
        )}

        {/* Send Button */}
        <Button
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={handleSendDonation}
          disabled={selectedAmount <= 0 || !message || status !== 'idle'}
        >
          <Send className="w-5 h-5 mr-2" />
          Отправить донат
        </Button>

        <p className="text-sm text-gray-500 text-center">
          Ваш баланс: {mockUser.balance} ₽
        </p>
      </div>
    </div>
  );
}