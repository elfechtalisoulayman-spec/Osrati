// src/types.ts

// نوع دور المستخدم: طفل أو ولي أمر
export type Role = 'PARENT' | 'CHILD';

// معلومات المستخدم (طفل أو ولي أمر)
export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  points: number;
  pin?: string;        // للأطفال (اختياري)
  password?: string;   // للآباء (اختياري)
  behaviorHearts: number;  // عدد القلوب السلوكية 0-5
  lastHeartDate: string;   // تاريخ آخر تحديث للقلوب (سلسلة تاريخ ISO)
}

// عادة / مهمة يومية
export interface Habit {
  id: string;
  title: string;
  icon: string;
  points: number;
  assignedTo: string[];   // قائمة IDs الأطفال المكلَّفين
  frequency: 'Daily' | 'Custom' | 'Once';
  timeOfDay: 'Morning' | 'Day' | 'Evening';
}

// مكافأة يمكن أن يستبدل بها الطفل نقاطه
export interface Reward {
  id: string;
  title: string;
  icon: string;
  cost: number;           // كم نقطة تحتاج هذه المكافأة
  description?: string;   // وصف المكافأة (اختياري)
  assignedTo: string[];   // IDs الأطفال الذين تظهر لهم هذه المكافأة
}

// سجل تنفيذ عادة معينة (Log)
export interface TaskLog {
  id: string;
  userId: string;         // ID الطفل
  habitId: string;        // ID العادة
  date: string;           // تاريخ التنفيذ (مثلاً "2025-01-01")
  status: 'DONE' | 'SKIPPED';
  pointsEarned: number;   // النقاط التي حصل عليها من هذه المهمة
}

// مهمة إضافية (ليست من العادات الأساسية)
export interface ExtraTask {
  id: string;
  title: string;
  childId: string;        // ID الطفل
  date: string;           // تاريخ المهمة
  points: number;         // نقاط المهمة
  done: boolean;          // هل تم تنفيذها أم لا
}

// الشكل الكامل لقاعدة بيانات التطبيق
export interface AppData {
  users: User[];
  habits: Habit[];
  rewards: Reward[];
  taskLogs: TaskLog[];
  extraTasks: ExtraTask[];
}
