import { STORAGE_KEYS } from '../constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn(`[Local Dev Storage] Operation ${operationType} on ${path}:`, error);
}

// User Profile Utils (Backed by localStorage for local development)
export async function getUserProfile(uid: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
    const profiles = raw ? JSON.parse(raw) : {};
    return profiles[uid] || null;
  } catch (error) {
    console.error('Error fetching local user profile:', error);
    return null;
  }
}

export async function createUserProfile(uid: string, data: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
    const profiles = raw ? JSON.parse(raw) : {};
    profiles[uid] = {
      ...data,
      uid,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error creating local user profile:', error);
  }
}

export async function updateUserProfile(uid: string, data: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
    const profiles = raw ? JSON.parse(raw) : {};
    profiles[uid] = {
      ...(profiles[uid] || {}),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error updating local user profile:', error);
  }
}

// Interview Utils (Backed by localStorage for local development)
export async function createInterview(data: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    const id = 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newInterview = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    interviews.unshift(newInterview);
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
    return id;
  } catch (error) {
    console.error('Error creating local interview record:', error);
    return 'local_' + Date.now();
  }
}

export async function getUserInterviews(userId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    return interviews.filter((item: any) => item.userId === userId);
  } catch (error) {
    console.error('Error fetching local user interviews:', error);
    return [];
  }
}

export async function getInterviewById(interviewId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    return interviews.find((item: any) => item.id === interviewId) || null;
  } catch (error) {
    console.error('Error fetching interview by id:', error);
    return null;
  }
}

export async function deleteInterview(interviewId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    const filtered = interviews.filter((item: any) => item.id !== interviewId);
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting interview:', error);
    return false;
  }
}


