// src/services/googleSheetsService.ts

import { AppData } from '../types';

// 🔗 رابط Web App من Google Apps Script
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxbAz7JyEZM1PCpjqkdWX58bC9kIBsNKM7S3TAkPYwpBh0tZJvI4hrso5KHDj4JW-Uo/exec';

export const syncWithCloud = async (
  localData: AppData,
): Promise<AppData | null> => {
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=SYNC`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(localData),
    });

    if (!response.ok) {
      console.error('HTTP Error status:', response.status);
      return null;
    }

    const result = await response.json();

    if (result.status === 'success') {
      return result.data as AppData;
    } else {
      console.error('Google Sheet Error:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Sync failed (probably offline):', error);
    return null;
  }
};
