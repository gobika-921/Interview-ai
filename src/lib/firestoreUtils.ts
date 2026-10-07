import { STORAGE_KEYS } from '../constants';

// Interview Utils (localStorage-backed)
export async function createInterview(data: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    const id = 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newInterview = {
      ...data,
      id,
      createdAt: (data.createdAt as string) || new Date().toISOString(),
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
    return interviews.filter((item: Record<string, unknown>) => item.userId === userId);
  } catch (error) {
    console.error('Error fetching local user interviews:', error);
    return [];
  }
}

export async function getInterviewById(interviewId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    return interviews.find((item: Record<string, unknown>) => item.id === interviewId) || null;
  } catch (error) {
    console.error('Error fetching interview by id:', error);
    return null;
  }
}

export async function deleteInterview(interviewId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    const interviews = raw ? JSON.parse(raw) : [];
    const filtered = interviews.filter((item: Record<string, unknown>) => item.id !== interviewId);
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting interview:', error);
    return false;
  }
}
