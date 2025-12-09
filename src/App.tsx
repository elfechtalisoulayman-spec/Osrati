// src/App.tsx
import React, { useState } from 'react';
import { useApp } from './context/AppContext';

// واجهة بسيطة جداً للتجربة واختبار المزامنة
const App: React.FC = () => {
  const { data, updateData, isSyncing, triggerSync } = useApp();
  const [childName, setChildName] = useState('');

  // دالة لإضافة طفل جديد
  const addChild = () => {
    if (!childName.trim()) return;

    const newUser = {
      id: Date.now().toString(),      // ID بسيط
      name: childName.trim(),        // الاسم من الحقل
      role: 'CHILD',                 // طفل
      avatar: '',                    // مؤقتاً فارغ
      points: 0,                     // يبدأ من 0
      behaviorHearts: 0,
      lastHeartDate: new Date().toISOString(),
    };

    updateData({
      users: [...data.users, newUser],
    });

    setChildName('');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Osrati 👨‍👩‍👧‍👦</h1>
      
      {/* إضافة طفل */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="اسم الطفل"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          style={{ padding: 8, fontSize: 16, marginRight: 8 }}
        />
        <button onClick={addChild} style={{ padding: 8, fontSize: 16 }}>
          إضافة
        </button>
      </div>

      <h2>الأطفال:</h2>
      {data.users.length === 0 && <p>لا يوجد أطفال بعد</p>}

      <ul>
        {data.users.map((u) => (
          <li key={u.id}>
            {u.name} — نقاط: {u.points}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button onClick={triggerSync} style={{ padding: 8, fontSize: 16 }}>
          {isSyncing ? '... جاري المزامنة' : 'مزامنة يدوية'}
        </button>
      </div>

      {isSyncing && <p>🟡 يتم إرسال البيانات الآن...</p>}
    </div>
  );
};

export default App;
