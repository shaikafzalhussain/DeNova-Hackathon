
import { VerificationRecord } from "../types";

/**
 * For this MVP demo, we use LocalStorage to simulate the Solana Devnet ledger.
 * This allows the Recruiter to "verify" records stored by the Candidate
 * without needing a real deployed Anchor program for the 2-minute pitch.
 */

const LEDGER_KEY = 'solana_resume_verifications';

export const storeVerificationOnChain = async (record: VerificationRecord): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const currentLedger = getLedger();
  currentLedger.push(record);
  localStorage.setItem(LEDGER_KEY, JSON.stringify(currentLedger));
  
  return record.signature;
};

export const fetchVerificationFromChain = async (hash: string): Promise<VerificationRecord | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const currentLedger = getLedger();
  return currentLedger.find(r => r.resume_hash === hash) || null;
};

const getLedger = (): VerificationRecord[] => {
  const data = localStorage.getItem(LEDGER_KEY);
  return data ? JSON.parse(data) : [];
};

export const generateResumeHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateMockSignature = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sig = '';
  for (let i = 0; i < 88; i++) {
    sig += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sig;
};
