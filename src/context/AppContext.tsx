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

// البيانات الأولية الفارغة
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

// ننشئ الكونتكست
const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// هذا هو المزود الرئيسي الذي سيلفّ التطبيق كله
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 1) نقرأ من localStorage عند أول تحميل للتطبيق (Offline First)
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

  // 2) أي تغيير في data نحفظه فوراً في localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('osrati_db', JSON.stringify(data));
      }
    } catch (e) {
      console.error('خطأ في حفظ البيانات محلياً:', e);
    }
  }, [data]);

  // 3) دالة المزامنة اليدوية / التلقائية مع Google Sheets
  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const cloudData = await syncWithCloud(data);

    if (cloudData) {
      // هنا نعتمد بيانات السحابة بالكامل (يمكن تطوير منطق الدمج لاحقاً)
      setData(cloudData);
      try {
        localStorage.setItem('osrati_db', JSON.stringify(cloudData));
      } catch (e) {
        console.error('خطأ في حفظ بيانات السحابة محلياً:', e);
      }
    }

    setIsSyncing(false);
  };

  // 4) مزامنة أولية عند فتح التطبيق + كل 5 دقائق مثلاً
  useEffect(() => {
    triggerSync();
    const interval = setInterval(triggerSync, 5 * 60 * 1000); // كل 5 دقائق
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5) دالة لتحديث البيانات من أي كومبوننت (تحدّث local ثم تحاول المزامنة)
  const updateData = (newData: Partial<AppData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      // محاولة مزامنة خفيفة بعد ثانية (بدون إزعاج الواجهة)
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

// هوك مريح لاستخدام الكونتكست داخل أي كومبوننت
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
