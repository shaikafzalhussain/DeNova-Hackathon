
import { User, Job, Application, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'rv_users',
  JOBS: 'rv_jobs',
  APPS: 'rv_apps'
};

const getData = <T>(key: string, def: T): T => {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : def;
};

const setData = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

export const api = {
  // Auth
  register: async (user: User): Promise<void> => {
    const users = getData<User[]>(STORAGE_KEYS.USERS, []);
    if (users.find(u => u.email === user.email)) throw new Error("User exists");
    users.push(user);
    setData(STORAGE_KEYS.USERS, users);
  },

  login: async (email: string, pass: string): Promise<User> => {
    // Fixed Recruiter Creds
    if (email === 'abc@abc.com' && pass === '12345678') {
      return { email, role: UserRole.RECRUITER };
    }
    
    const users = getData<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) throw new Error("Invalid credentials");
    return user;
  },

  // Jobs
  getJobs: async (): Promise<Job[]> => getData<Job[]>(STORAGE_KEYS.JOBS, []),
  
  postJob: async (job: Omit<Job, 'id' | 'createdAt'>): Promise<void> => {
    const jobs = getData<Job[]>(STORAGE_KEYS.JOBS, []);
    const newJob: Job = { ...job, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
    jobs.push(newJob);
    setData(STORAGE_KEYS.JOBS, jobs);
  },

  // Applications
  getApplications: async (jobId?: string): Promise<Application[]> => {
    const apps = getData<Application[]>(STORAGE_KEYS.APPS, []);
    return jobId ? apps.filter(a => a.jobId === jobId) : apps;
  },

  submitApplication: async (app: Application): Promise<void> => {
    const apps = getData<Application[]>(STORAGE_KEYS.APPS, []);
    apps.push(app);
    setData(STORAGE_KEYS.APPS, apps);
  }
};
