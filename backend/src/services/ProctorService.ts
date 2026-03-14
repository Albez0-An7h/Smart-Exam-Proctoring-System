import { ProctorLogRepository } from '../repositories/ProctorLogRepository';

const proctorRepo = new ProctorLogRepository();

// Observer interface for proctoring events
export interface ProctoringObserver {
  onEvent(attemptId: string, eventType: string, count: number): void;
}

// Concrete observer: logs a warning if violations exceed threshold
class ViolationThresholdObserver implements ProctoringObserver {
  private threshold: number;
  constructor(threshold = 3) {
    this.threshold = threshold;
  }
  onEvent(attemptId: string, eventType: string, count: number): void {
    if (count >= this.threshold) {
      console.warn(`[PROCTOR] Attempt ${attemptId} exceeded violation threshold (${count} events of type: ${eventType})`);
    }
  }
}

export class ProctorService {
  private observers: ProctoringObserver[] = [];

  constructor() {
    // Register default observers
    this.observers.push(new ViolationThresholdObserver(3));
  }

  addObserver(observer: ProctoringObserver) {
    this.observers.push(observer);
  }

  async logEvent(attemptId: string, eventType: string) {
    const log = await proctorRepo.create(attemptId, eventType);
    const count = await proctorRepo.countByAttempt(attemptId);

    // Notify all observers (Observer Pattern)
    this.observers.forEach(obs => obs.onEvent(attemptId, eventType, count));

    return { log, totalEvents: count };
  }

  async getLogsForAttempt(attemptId: string) {
    return proctorRepo.findByAttempt(attemptId);
  }
}
