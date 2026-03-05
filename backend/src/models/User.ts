export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export abstract class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public role: Role
  ) {}

  // Abstract methods can force subclasses to implement specific behavior
  abstract performRoleSpecificAction(): void;
}

export class Student extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, Role.STUDENT);
  }

  performRoleSpecificAction(): void {
    // Specific logic for student
  }
}

export class Teacher extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, Role.TEACHER);
  }

  performRoleSpecificAction(): void {
    // Specific logic for teacher
  }
}

export class Admin extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, Role.ADMIN);
  }

  performRoleSpecificAction(): void {
    // Specific logic for admin
  }
}
