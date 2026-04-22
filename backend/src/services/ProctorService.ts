import { ProctorLogRepository } from '../repositories/ProctorLogRepository';

export interface ProctoringObserver {
  onEvent(attemptId: string, eventType: string, count: number): void;
}

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

  constructor(private readonly proctorRepo: ProctorLogRepository = new ProctorLogRepository()) {
    this.observers.push(new ViolationThresholdObserver(3));
  }

  addObserver(observer: ProctoringObserver) {
    this.observers.push(observer);
  }

  async logEvent(attemptId: string, eventType: string) {
    const log = await this.proctorRepo.create(attemptId, eventType);
    const count = await this.proctorRepo.countByAttempt(attemptId);

    this.observers.forEach(obs => obs.onEvent(attemptId, eventType, count));

    return { log, totalEvents: count };
  }

  async getLogsForAttempt(attemptId: string) {
    return this.proctorRepo.findByAttempt(attemptId);
  }
}
