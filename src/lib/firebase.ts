import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDocs, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MeterRecord, GoogleSheetConfig } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on load
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system_config', 'connection_test'));
    console.log('[Firestore] Connection test succeeded');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline, checking configuration');
    } else {
      console.log('[Firestore] Connection test initialized');
    }
    return false;
  }
}

/**
 * Subscribe to real-time updates for meter records in Firestore
 */
export function subscribeToRealtimeRecords(
  onUpdate: (records: MeterRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  const recordsCol = collection(db, 'meter_records');
  
  const unsubscribe = onSnapshot(
    recordsCol,
    (snapshot) => {
      const records: MeterRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as MeterRecord);
      });
      if (records.length > 0) {
        onUpdate(records);
      }
    },
    (error) => {
      console.error('[Firestore Realtime Error]:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'meter_records');
    }
  );

  return unsubscribe;
}

/**
 * Sync a list of records to Firestore in batches (real-time push)
 */
export async function syncRecordsToFirestore(records: MeterRecord[]): Promise<void> {
  if (!records || records.length === 0) return;
  
  try {
    // Firestore batch limits to 500 writes per batch
    const BATCH_SIZE = 450;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      
      chunk.forEach((rec) => {
        if (rec.id) {
          const docRef = doc(db, 'meter_records', String(rec.id));
          batch.set(docRef, {
            ...rec,
            updatedAt: rec.updatedAt || new Date().toISOString()
          }, { merge: true });
        }
      });
      
      await batch.commit();
    }
    console.log(`[Firestore] Successfully synchronized ${records.length} records to Firestore.`);
  } catch (err) {
    console.error('[Firestore Write Error]:', err);
    handleFirestoreError(err, OperationType.WRITE, 'meter_records');
  }
}

/**
 * Save a single record real-time to Firestore
 */
export async function saveSingleRecordToFirestore(record: MeterRecord): Promise<void> {
  if (!record || !record.id) return;
  try {
    const docRef = doc(db, 'meter_records', String(record.id));
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firestore] Record ${record.id} saved real-time.`);
  } catch (err) {
    console.error('[Firestore Single Record Error]:', err);
    handleFirestoreError(err, OperationType.WRITE, `meter_records/${record.id}`);
  }
}
