import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, Shield, AlertTriangle, MessageSquare, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { stopWordsApi } from '../../services/api';
import type { StopWord } from '../types';

export function StopWords() {
  const [stopWords, setStopWords] = useState<StopWord[]>([]);
  const [newWord, setNewWord] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadStopWords();
  }, []);

  const loadStopWords = async () => {
    try {
      setIsLoading(true);
      const words = await stopWordsApi.getAll();
      setStopWords(Array.isArray(words) ? words : []);
    } catch (error) {
      console.warn('Stop words not available yet');
      setStopWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWord = async () => {
    const trimmedWord = newWord.trim().toLowerCase();
    
    if (!trimmedWord) {
      toast.error('Введите слово');
      return;
    }

    if ((stopWords || []).some(w => w.word.toLowerCase() === trimmedWord)) {
      toast.error('Это слово уже в списке');
      return;
    }

    setIsAdding(true);
    try {
      const addedWord = await stopWordsApi.add(trimmedWord);
      setStopWords(prev => [...(prev || []), addedWord]);
      setNewWord('');
      toast.success(
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Слово <b>"{trimmedWord}"</b> добавлено</span>
        </div>
      );
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при добавлении слова');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveWord = async (wordId: number, word: string) => {
    setDeletingId(wordId);
    try {
      await stopWordsApi.remove(wordId);
      setStopWords(prev => (prev || []).filter(w => w.id !== wordId));
      toast.info(
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Слово <b>"{word}"</b> удалено</span>
        </div>
      );
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при удалении слова');
    } finally {
      setDeletingId(null);
    }
  };

  // Безопасная переменная
  const words = stopWords || [];
  const wordsCount = words.length;

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
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Стоп-слова</h2>
              <p className="text-gray-400 text-sm">Фильтрация нежелательного контента</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Alert className="bg-red-500/5 border-red-500/30 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300/80">
            Донаты с сообщениями, содержащими эти слова, будут автоматически отклонены и не отобразятся на стриме
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Add Word */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="Введите запрещённое слово..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isAdding && handleAddWord()}
                  disabled={isAdding}
                  className="h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 rounded-xl pr-12"
                />
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <Button 
                onClick={handleAddWord} 
                disabled={isAdding}
                className="h-12 px-4 sm:px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border-0 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 rounded-xl"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                    <span className="hidden sm:inline">Добавить</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Words List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  Список запрещённых слов
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {wordsCount === 0 
                    ? 'Список пуст — добавьте первое слово' 
                    : `${wordsCount} ${wordsCount === 1 ? 'слово' : wordsCount < 5 ? 'слова' : 'слов'} в списке`}
                </CardDescription>
              </div>
              {wordsCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1">
                  {wordsCount}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {wordsCount === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl mb-4"
                >
                  🛡️
                </motion.div>
                <p className="text-gray-400 text-lg">Список пуст</p>
                <p className="text-gray-500 text-sm mt-1">
                  Добавьте слова, которые должны фильтроваться в сообщениях донатов
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {words.map((word, index) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 group hover:border-red-500/30 hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-400 font-bold text-sm">#</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{word.word}</p>
                          <p className="text-xs text-gray-500">ID: {word.id}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWord(word.id, word.word)}
                        disabled={deletingId === word.id}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        {deletingId === word.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Советы по модерации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: '💡',
                  title: 'Будьте конкретны',
                  desc: 'Добавляйте точные слова, а не общие фразы'
                },
                {
                  icon: '🔄',
                  title: 'Регулярно обновляйте',
                  desc: 'Проверяйте и дополняйте список после каждого стрима'
                },
                {
                  icon: '🎯',
                  title: 'Не переусердствуйте',
                  desc: 'Слишком много слов может замедлить обработку сообщений'
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30">
                  <div className="text-xl flex-shrink-0">{item.icon}</div>
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
    </div>
  );
}