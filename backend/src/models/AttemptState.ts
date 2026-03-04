export abstract class AttemptState {
  abstract nextState(): AttemptState;
  abstract getStatus(): string;
}

export class NotStartedState extends AttemptState {
  nextState(): AttemptState {
    return new InProgressState();
  }
  getStatus(): string {
    return 'NOT_STARTED';
  }
}

export class InProgressState extends AttemptState {
  nextState(): AttemptState {
    return new SubmittedState();
  }
  getStatus(): string {
    return 'IN_PROGRESS';
  }
}

export class SubmittedState extends AttemptState {
  nextState(): AttemptState {
    return new EvaluatedState();
  }
  getStatus(): string {
    return 'SUBMITTED';
  }
}

export class EvaluatedState extends AttemptState {
  nextState(): AttemptState {
    return this; // Final state
  }
  getStatus(): string {
    return 'EVALUATED';
  }
}

export class AttemptContext {
  private state: AttemptState;

  constructor() {
    this.state = new NotStartedState();
  }

  setState(state: AttemptState) {
    this.state = state;
  }

  proceedToNextState() {
    this.state = this.state.nextState();
  }

  getCurrentStatus(): string {
    return this.state.getStatus();
  }
}
