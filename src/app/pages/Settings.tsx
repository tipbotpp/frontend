import { useState } from 'react';
import { Palette, Shield, Coins, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCustomizer } from '../components/AlertCustomizer';
import { StopWords } from '../components/StopWords';
import { PassiveIncome } from '../components/PassiveIncome';

const TABS = [
  {
    id: 'alerts',
    label: 'Алерты',
    icon: Palette,
    description: 'Настройка уведомлений о донатах',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    glow: 'shadow-purple-500/30',
  },
  {
    id: 'stopwords',
    label: 'Стоп-слова',
    icon: Shield,
    description: 'Фильтрация нежелательных сообщений',
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-500/20 to-orange-500/20',
    glow: 'shadow-red-500/30',
  },
  {
    id: 'passive',
    label: 'Пассивный доход',
    icon: Coins,
    description: 'Автоматическое начисление монет',
    gradient: 'from-cyan-500 to-emerald-500',
    bgGradient: 'from-cyan-500/20 to-emerald-500/20',
    glow: 'shadow-cyan-500/30',
  },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('alerts');
  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden pb-6">
      {/* Анимированный фон */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0f0f1a] via-[#13132b] to-[#0a0a1a] border-b border-gray-800/50"
        >
          {/* Декоративные линии */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          </div>

          <div className="px-6 pt-10 pb-8 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Настройки</h1>
                  <p className="text-gray-400 text-sm">Управление стримом и виджетами</p>
                </div>
              </div>
            </motion.div>

            {/* Active Tab Description */}
            <AnimatePresence mode="wait">
              {activeTabData && (
                <motion.div
                  key={activeTabData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${activeTabData.bgGradient} border border-gray-700/50`}
                >
                  <activeTabData.icon className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">{activeTabData.label}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 text-sm">{activeTabData.description}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="px-6 -mt-4">
          <Tabs defaultValue="alerts" onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-1.5 shadow-xl">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`relative gap-2 py-3 rounded-xl transition-all duration-300 overflow-hidden group ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {/* Active background */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl`}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Active glow */}
                    {activeTab === tab.id && (
                      <div className={`absolute inset-0 rounded-xl shadow-lg ${tab.glow}`} />
                    )}
                    
                    <div className="relative flex items-center gap-2">
                      <tab.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                        activeTab === tab.id ? 'text-white' : ''
                      }`} />
                      <span className="hidden sm:inline font-medium">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            {/* Tab Content */}
            <TabsContent value="alerts">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AlertCustomizer />
              </motion.div>
            </TabsContent>

            <TabsContent value="stopwords">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StopWords />
              </motion.div>
            </TabsContent>

            <TabsContent value="passive">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <PassiveIncome />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
export default Settings;