
import { User, AccessKey, Project, SystemSettings } from '../types';

const STORAGE_KEY = 'STUDIO_PRO_META_V4';
const DB_NAME = 'StudioPro_Projects_DB_V4';
const DB_VERSION = 1;
const syncChannel = new BroadcastChannel('studio_pro_sync');

// OWNER SECRET CODE
const MASTER_OWNER_CODE = 'harshit5034vharshit5034v';

interface MetaState {
  users: Record<string, User>;
  keys: Record<string, AccessKey>;
  settings: SystemSettings;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: ['uid', 'id'] });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getInitialMeta = (): MetaState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  
  const adminKey: AccessKey = {
    id: 'OWNER-MASTER-KEY',
    key: MASTER_OWNER_CODE,
    maxProductionMinutes: 999999999, // Infinite for owner
    usedMinutes: 0,
    isBanned: false,
    createdBy: 'SYSTEM'
  };

  return {
    users: {},
    keys: { [adminKey.key]: adminKey },
    settings: {
      appName: 'ANYTIME STUDIO',
      accentColor: '#6366f1'
    }
  };
};

let meta: MetaState = getInitialMeta();

const persistMeta = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  syncChannel.postMessage({ type: 'SYNC_META', payload: meta });
};

syncChannel.onmessage = (event) => {
  if (event.data.type === 'SYNC_META') {
    meta = event.data.payload;
    window.dispatchEvent(new CustomEvent('db_updated'));
  }
};

export const DB = {
  getSettings: () => meta.settings,
  
  updateSettings: (settings: Partial<SystemSettings>) => {
    meta.settings = { ...meta.settings, ...settings };
    persistMeta();
  },

  validateKey: (key: string): { key: AccessKey | null; error: string | null } => {
    // Check if it's the master owner code first
    if (key === MASTER_OWNER_CODE) {
      return { key: meta.keys[MASTER_OWNER_CODE], error: null };
    }

    const k = meta.keys[key];
    if (!k) return { key: null, error: 'INVALID' };
    if (k.isBanned) return { key: null, error: 'EXPIRED' };
    if (k.usedMinutes >= k.maxProductionMinutes) return { key: null, error: 'EXHAUSTED' };
    return { key: k, error: null };
  },
  
  generateKey: (adminUid: string, limitMinutes: number): string => {
    const newKeyStr = `PRO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newKey: AccessKey = {
      id: crypto.randomUUID(),
      key: newKeyStr,
      maxProductionMinutes: limitMinutes,
      usedMinutes: 0,
      isBanned: false,
      createdBy: adminUid
    };
    meta.keys[newKeyStr] = newKey;
    persistMeta();
    return newKeyStr;
  },

  banKey: (keyStr: string) => {
    if (keyStr === MASTER_OWNER_CODE) return; // Cannot ban the owner code
    if (meta.keys[keyStr]) {
      meta.keys[keyStr].isBanned = true;
      const user = Object.values(meta.users).find(u => u.accessKeyId === keyStr);
      if (user) user.status = 'banned';
      persistMeta();
    }
  },

  promoteToAdmin: (uid: string) => {
    if (meta.users[uid]) {
      meta.users[uid].role = 'admin';
      persistMeta();
    }
  },

  registerUser: (name: string, email: string, keyStr: string): User => {
    const existingUser = Object.values(meta.users).find(u => u.email === email);
    if (existingUser) return existingUser;

    const newUser: User = {
      uid: `USR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name,
      email,
      role: keyStr === MASTER_OWNER_CODE ? 'admin' : 'user',
      status: 'active',
      joinedAt: Date.now(),
      totalProductionMinutes: 0,
      accessKeyId: keyStr
    };
    meta.users[newUser.uid] = newUser;
    meta.keys[keyStr].ownerUid = newUser.uid;
    persistMeta();
    return newUser;
  },

  updateUserProduction: (uid: string, minutes: number) => {
    const user = meta.users[uid];
    if (user) {
      user.totalProductionMinutes += minutes;
      const key = meta.keys[user.accessKeyId];
      if (key) key.usedMinutes += minutes;
      persistMeta();
    }
  },

  getAllUsers: () => Object.values(meta.users),
  getAllKeys: () => Object.values(meta.keys),

  saveProject: async (uid: string, project: Project) => {
    const db = await openDB();
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    await store.put({ ...project, uid });
    window.dispatchEvent(new CustomEvent('db_updated'));
  },

  getUserProjects: async (uid: string): Promise<Project[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result.filter(p => p.uid === uid).sort((a,b) => b.createdAt - a.createdAt));
      };
    });
  },
  
  deleteProject: async (uid: string, projectId: string) => {
    const db = await openDB();
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    await store.delete([uid, projectId]);
    window.dispatchEvent(new CustomEvent('db_updated'));
  }
};
