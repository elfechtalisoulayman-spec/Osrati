// src/App.tsx
import React, { useState } from 'react';
import { useApp } from './context/AppContext';

const App: React.FC = () => {
  const { data, updateData, isSyncing, triggerSync } = useApp();
  const [childName, setChildName] = useState('');

  const addChild = () => {
    if (!childName.trim()) return;

    const newUser = {
      id: Date.now().toString(),
      name: childName.trim(),
      role: 'CHILD' as const,
      avatar: '',
      points: 0,
      behaviorHearts: 0,
      lastHeartDate: new Date().toISOString(),
    };

    updateData({
      users: [...data.users, newUser],
    });

    setChildName('');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Osrati 👨‍👩‍👧‍👦</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="اسم الطفل"
          value={childName}
          onChange={e => setChildName(e.target.value)}
          style={{ padding: 8, fontSize: 16, marginLeft: 8 }}
        />
        <button onClick={addChild} style={{ padding: 8, fontSize: 16 }}>
          إضافة
        </button>
      </div>

      <h2>الأطفال:</h2>
      {data.users.length === 0 && <p>لا يوجد أطفال بعد</p>}

      <ul>
        {data.users.map(u => (
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
    </div>
  );
};

export default App;
