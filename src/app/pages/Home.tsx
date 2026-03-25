import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { mockUser, mockStreamers } from '../mock-data';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const filteredStreamers = mockStreamers.filter(streamer =>
    streamer.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeposit = (amount: number) => {
    // Mock deposit logic
    toast.success(`Баланс пополнен на ${amount} ₽!`);
    setDepositDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Добро пожаловать,</p>
            <h1 className="text-2xl font-bold">{mockUser.username}</h1>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => setDepositDialogOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-sm opacity-90 mb-1">Ваш баланс</p>
          <p className="text-4xl font-bold">{mockUser.balance} ₽</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 -mt-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Поиск стримеров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white shadow-lg border-0 rounded-2xl"
          />
        </div>
      </div>

      {/* Streamers List */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Активные стримеры</h2>
          <div className="flex items-center gap-1 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStreamers.map((streamer) => (
            <div
              key={streamer.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={streamer.avatar}
                      alt={streamer.username}
                      className="w-16 h-16 rounded-full"
                    />
                    {streamer.isLive && (
                      <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-white px-2 py-0 text-xs">
                        LIVE
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{streamer.username}</h3>
                    <p className="text-sm text-gray-600 truncate">{streamer.description}</p>
                    
                    {streamer.goal && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{streamer.goal.description}</span>
                          <span className="font-medium">
                            {streamer.goal.current}/{streamer.goal.target}
                          </span>
                        </div>
                        <Progress 
                          value={(streamer.goal.current / streamer.goal.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => navigate(`/streamer/${streamer.id}`)}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Сделать донат
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredStreamers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Стримеры не найдены</p>
          </div>
        )}
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Пополнить баланс</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeposit(100)}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">+100</div>
                  <div className="text-xs text-gray-500">₽</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeposit(500)}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">+500</div>
                  <div className="text-xs text-gray-500">₽</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeposit(1000)}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">+1000</div>
                  <div className="text-xs text-gray-500">₽</div>
                </div>
              </Button>
            </div>

            <div>
              <Input
                type="number"
                placeholder="Или введите свою сумму"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <Button
                className="w-full mt-2"
                onClick={() => handleDeposit(Number(depositAmount))}
                disabled={!depositAmount || Number(depositAmount) <= 0}
              >
                Пополнить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}