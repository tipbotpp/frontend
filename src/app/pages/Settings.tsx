import { Palette, Shield, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCustomizer } from '../components/AlertCustomizer';
import { StopWords } from '../components/StopWords';
import { PassiveIncome } from '../components/PassiveIncome';

export function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Настройки</h1>
        <p className="text-purple-100">Настройка виджетов и правил</p>
      </div>

      <div className="px-6 -mt-4">
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg">
            <TabsTrigger value="alerts" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Алерты</span>
            </TabsTrigger>
            <TabsTrigger value="stopwords" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Стоп-слова</span>
            </TabsTrigger>
            <TabsTrigger value="passive" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Пассивный доход</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <AlertCustomizer />
          </TabsContent>

          <TabsContent value="stopwords">
            <StopWords />
          </TabsContent>

          <TabsContent value="passive">
            <PassiveIncome />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}