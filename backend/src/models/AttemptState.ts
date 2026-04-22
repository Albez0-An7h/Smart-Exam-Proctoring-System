import { AttemptStatus } from '@prisma/client';

export abstract class AttemptState {
  abstract nextState(): AttemptState;
  abstract getStatus(): AttemptStatus;
}

export class NotStartedState extends AttemptState {
  nextState(): AttemptState {
    return new InProgressState();
  }
  getStatus(): AttemptStatus {
    return 'NOT_STARTED';
  }
}

export class InProgressState extends AttemptState {
  nextState(): AttemptState {
    return new SubmittedState();
  }
  getStatus(): AttemptStatus {
    return 'IN_PROGRESS';
  }
}

export class SubmittedState extends AttemptState {
  nextState(): AttemptState {
    return new EvaluatedState();
  }
  getStatus(): AttemptStatus {
    return 'SUBMITTED';
  }
}

export class EvaluatedState extends AttemptState {
  nextState(): AttemptState {
    return this;
  }
  getStatus(): AttemptStatus {
    return 'EVALUATED';
  }
}

export class AttemptContext {
  private state: AttemptState;

  private static readonly allowedTransitions: Record<AttemptStatus, AttemptStatus[]> = {
    NOT_STARTED: ['IN_PROGRESS'],
    IN_PROGRESS: ['SUBMITTED'],
    SUBMITTED: ['EVALUATED'],
    AUTO_SUBMITTED: ['EVALUATED'],
    EVALUATED: ['EVALUATED'],
  };

  constructor() {
    this.state = new NotStartedState();
  }

  setState(state: AttemptState) {
    this.state = state;
  }

  proceedToNextState() {
    const currentStatus = this.state.getStatus();
    const nextState = this.state.nextState();
    const nextStatus = nextState.getStatus();
    const allowed = AttemptContext.allowedTransitions[currentStatus] ?? [];

    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid attempt transition: ${currentStatus} -> ${nextStatus}`);
    }

    this.state = nextState;
  }

  getCurrentStatus(): AttemptStatus {
    return this.state.getStatus();
  }
}
