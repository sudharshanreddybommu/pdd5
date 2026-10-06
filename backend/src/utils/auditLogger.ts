import { memoryDb } from '../database/db.js';

export function logAudit(
  userId: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  ip?: string,
  userAgent?: string
) {
  const auditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    action,
    resource,
    resourceId: resourceId || null,
    detailsJson: details ? JSON.stringify(details) : null,
    ipAddress: ip || '127.0.0.1',
    userAgent: userAgent || 'OPMD Care Client',
    createdAt: new Date().toISOString()
  };

  memoryDb.auditLogs.unshift(auditEntry);
  if (memoryDb.auditLogs.length > 2000) {
    memoryDb.auditLogs.pop();
  }
  memoryDb.save();
}
