// src/services/googleSheetsService.ts

import { AppData } from '../types';

// 🔗 رابط Web App من Google Apps Script (الذي أعطيتني إيّاه)
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxbAz7JyEZM1PCpjqkdWX58bC9kIBsNKM7S3TAkPYwpBh0tZJvI4hrso5KHDj4JW-Uo/exec';

/**
 * تقوم هذه الدالة بمزامنة البيانات بين التطبيق و Google Sheets.
 * - ترسل AppData الحالية (من الواجهة أو من localStorage)
 * - تستقبل AppData محدثة من الشيت (أو null لو فشل الاتصال)
 */
export const syncWithCloud = async (localData: AppData): Promise<AppData | null> => {
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=SYNC`, {
      method: 'POST',
      // نستخدم text/plain لتفادي تعقيد الـ CORS والطلبات المسبقة (OPTIONS)
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(localData),
    });

    if (!response.ok) {
      // مثلاً 500 أو 404
      console.error('HTTP Error status:', response.status);
      return null;
    }

    const result = await response.json();

    if (result.status === 'success') {
      // نرجع البيانات القادمة من السحابة (Google Sheets)
      return result.data as AppData;
    } else {
      console.error('Google Sheet Error:', result.message);
      return null;
    }
  } catch (error) {
    // في حال عدم وجود إنترنت أو خطأ آخر
    console.error('Sync failed (probably offline):', error);
    return null;
  }
};
