import fs from 'fs';
import path from 'path';

let prisma: any = null;
let usePrisma = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const clientModule = require('@prisma/client');
  if (clientModule && clientModule.PrismaClient) {
    prisma = new clientModule.PrismaClient();
    usePrisma = true;
  }
} catch (err) {
  // Fallback to in-memory/JSON datastore
}

export { prisma, usePrisma };

// Unified in-memory/JSON store with automatic persistence for development & tests
class MemoryDb {
  public users: any[] = [];
  public emailVerifications: any[] = [];
  public passwordResets: any[] = [];
  public patientProfiles: any[] = [];
  public doctorProfiles: any[] = [];
  public hospitals: any[] = [];
  public doctorAvailabilities: any[] = [];
  public screenings: any[] = [];
  public screeningImages: any[] = [];
  public symptoms: any[] = [];
  public screeningSymptoms: any[] = [];
  public predictions: any[] = [];
  public reports: any[] = [];
  public appointments: any[] = [];
  public appointmentStatusHistories: any[] = [];
  public payments: any[] = [];
  public paymentProofs: any[] = [];
  public notifications: any[] = [];
  public datasets: any[] = [];
  public mlModels: any[] = [];
  public auditLogs: any[] = [];

  public webauthnCredentials: any[] = [];
  public webauthnChallenges: Map<string, string> = new Map();

  private getFilePath(): string {
    const backendPath = path.resolve(process.cwd(), 'backend', 'data_store.json');
    if (fs.existsSync(backendPath)) {
      return backendPath;
    }
    const directPath = path.resolve(process.cwd(), 'data_store.json');
    if (fs.existsSync(directPath)) {
      return directPath;
    }
    return fs.existsSync(path.resolve(process.cwd(), 'backend')) ? backendPath : directPath;
  }

  constructor() {
    this.load();
  }

  public save() {
    try {
      const filePath = this.getFilePath();
      const data = {
        users: this.users,
        webauthnCredentials: this.webauthnCredentials,
        emailVerifications: this.emailVerifications,
        passwordResets: this.passwordResets,
        patientProfiles: this.patientProfiles,
        doctorProfiles: this.doctorProfiles,
        hospitals: this.hospitals,
        doctorAvailabilities: this.doctorAvailabilities,
        screenings: this.screenings,
        screeningImages: this.screeningImages,
        symptoms: this.symptoms,
        screeningSymptoms: this.screeningSymptoms,
        predictions: this.predictions,
        reports: this.reports,
        appointments: this.appointments,
        appointmentStatusHistories: this.appointmentStatusHistories,
        payments: this.payments,
        paymentProofs: this.paymentProofs,
        notifications: this.notifications,
        datasets: this.datasets,
        mlModels: this.mlModels,
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Ignored in transient environments
    }
  }

  public load() {
    try {
      const filePath = this.getFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        Object.assign(this, data);
      }
    } catch (e) {
      // Start fresh
    }
  }
}

export const memoryDb = new MemoryDb();
