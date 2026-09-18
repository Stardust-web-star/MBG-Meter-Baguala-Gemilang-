import { MeterRecord } from '../types';

/**
 * Firebase completely removed and deactivated per user instruction.
 * All functions here are safe no-ops to prevent breaking any residual references.
 */

export const db = null as any;
export const auth = null as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function isFirestoreQuotaExceeded(): boolean {
  return false;
}

export function handleFirestoreError(_error: unknown, _operationType: OperationType, _path: string | null) {
  // No-op
}

export async function testFirestoreConnection(): Promise<boolean> {
  return false;
}

export function subscribeToRealtimeRecords(
  _onUpdate: (records: MeterRecord[]) => void,
  _onError?: (err: any) => void
): () => void {
  return () => {};
}

export async function syncRecordsToFirestore(_records: MeterRecord[]): Promise<void> {
  return;
}

export async function saveSingleRecordToFirestore(_record: MeterRecord): Promise<void> {
  return;
}
