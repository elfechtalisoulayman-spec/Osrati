// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { AppData } from '../types';
import { syncWithCloud } from '../services/googleSheetsService';

const INITIAL_DATA: AppData = {
  users: [],
  habits: [],
  rewards: [],
  taskLogs: [],
  extraTasks: [],
};

interface AppContextType {
  data: AppData;
  isSyncing: boolean;
  updateData: (newData: Partial<AppData>) => void;
  triggerSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // نقرأ من localStorage مرة واحدة عند بداية التطبيق
  const [data, setData] = useState<AppData>(() => {
    if (typeof window === 'undefined') return INITIAL_DATA;
    try {
      const saved = localStorage.getItem('osrati_db');
      return saved ? (JSON.parse(saved) as AppData) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // أي تغيير في data يتم حفظه محلياً فوراً
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('osrati_db', JSON.stringify(data));
      }
    } catch (e) {
      console.error('خطأ في حفظ البيانات محلياً:', e);
    }
  }, [data]);

  // مزامنة مع السحابة
  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const cloudData = await syncWithCloud(data);

    if (cloudData) {
      // Apps Script يقوم بدمج البيانات، لذا نعتمد ما يرجع من السحابة
      setData(cloudData);
      try {
        localStorage.setItem('osrati_db', JSON.stringify(cloudData));
      } catch (e) {
        console.error('خطأ في حفظ بيانات السحابة محلياً:', e);
      }
    }

    setIsSyncing(false);
  };

  // مزامنة أولية + كل 5 دقائق
  useEffect(() => {
    triggerSync();
    const interval = setInterval(triggerSync, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحديث البيانات من أي كومبوننت
  const updateData = (newData: Partial<AppData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      // محاولة مزامنة بعد ثانية (بدون إزعاج الواجهة)
      setTimeout(() => {
        triggerSync();
      }, 1000);
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ data, isSyncing, updateData, triggerSync }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
