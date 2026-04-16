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

  abstract performRoleSpecificAction(): void;
}

export class Student extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, Role.STUDENT);
  }

  performRoleSpecificAction(): void {
  }
}

export class Teacher extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, Role.TEACHER);
  }

  performRoleSpecificAction(): void {
  }
}

export class Admin extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, Role.ADMIN);
  }

  performRoleSpecificAction(): void {
  }
}
