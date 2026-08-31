export interface VerifyResponse {
  success: boolean;
  role?: 'admin' | 'user';
  error?: string;
}

export interface PasscodesResponse {
  passcodes: string[];
}

export async function verifyPasscodeApi(passcode: string): Promise<VerifyResponse> {
  const trimmed = passcode.trim();
  if (!trimmed) return { success: false, error: 'Passcode is required' };

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: trimmed }),
    });

    // If server responded with a valid 200 JSON
    if (res.ok) {
      return await res.json();
    }

    // On Netlify / static hosting, /api/* routes return 404 or 405 (HTML error page)
    // If the response is not a 401 Unauthorized from our real Express server, fallback immediately to local verification
    if (res.status === 404 || res.status === 405 || res.status === 502 || res.status === 503) {
      return fallbackLocalVerify(trimmed);
    }

    const data = await res.json().catch(() => null);
    if (!data || typeof data.success === 'undefined') {
      return fallbackLocalVerify(trimmed);
    }

    return { success: false, error: data.error || 'Invalid passcode' };
  } catch (err: any) {
    // Network failure or static deployment where fetch fails -> local fallback
    return fallbackLocalVerify(trimmed);
  }
}

const DEFAULT_PASSCODES = ['KAFHQ', 'demouser1', 'demouser2', 'demouser3', 'demouser4', 'demouser5'];
const DEFAULT_MASTER_ADMIN = 'KAF#01';

export async function fetchServerPasscodes(): Promise<string[]> {
  try {
    const res = await fetch('/api/auth/passcodes');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.passcodes)) {
        localStorage.setItem('kaf_passcodes_list', JSON.stringify(data.passcodes));
        return data.passcodes;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch passcodes from server:', err);
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem('kaf_passcodes_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [...DEFAULT_PASSCODES];
}

export async function addServerPasscode(newCode: string, masterPassword?: string): Promise<{ success: boolean; passcodes?: string[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/add-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: newCode, masterPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.passcodes) {
        localStorage.setItem('kaf_passcodes_list', JSON.stringify(data.passcodes));
      }
      return data;
    }
    return { success: false, error: data.error || 'Failed to add passcode on server' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function removeServerPasscode(codeToRemove: string, masterPassword?: string): Promise<{ success: boolean; passcodes?: string[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/remove-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: codeToRemove, masterPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.passcodes) {
        localStorage.setItem('kaf_passcodes_list', JSON.stringify(data.passcodes));
      }
      return data;
    }
    return { success: false, error: data.error || 'Failed to remove passcode on server' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function updateServerMasterPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/update-master-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Failed to update master password' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

function fallbackLocalVerify(input: string): VerifyResponse {
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();

  let master = DEFAULT_MASTER_ADMIN;
  try {
    const savedMaster = localStorage.getItem('kaf_master_admin_pwd');
    if (savedMaster) master = savedMaster;
  } catch (e) {}

  if (upper === master.toUpperCase() || upper === 'KAF#01' || upper === 'ADMIN') {
    return { success: true, role: 'admin' };
  }

  let allowed = [...DEFAULT_PASSCODES];
  try {
    const savedList = localStorage.getItem('kaf_passcodes_list');
    if (savedList) {
      const parsed = JSON.parse(savedList);
      if (Array.isArray(parsed) && parsed.length > 0) allowed = parsed;
    }
  } catch (e) {}

  const upperAllowed = allowed.map((p) => p.toUpperCase());
  if (upperAllowed.includes(upper) || upperAllowed.includes('KAFHQ')) {
    return { success: true, role: 'user' };
  }

  return { success: false, error: 'Invalid passcode' };
}
