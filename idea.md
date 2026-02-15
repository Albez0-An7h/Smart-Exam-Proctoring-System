# Smart Exam & Proctoring System

## 1. Project Overview

The Smart Exam & Proctoring System is a full-stack web application designed to conduct secure, scalable, and automated online examinations.

The system enables teachers to create and manage exams, students to attempt exams within a controlled environment, and administrators to monitor system-level activity. It incorporates automated evaluation, proctoring mechanisms, role-based access control, and performance analytics.

The primary focus of this project is backend system design, object-oriented modeling, and clean architectural practices.

---

## 2. Problem Statement

Traditional online exam systems often lack:

- Secure attempt handling  
- Scalable evaluation engines  
- Proper proctoring mechanisms  
- Clear separation of concerns in backend architecture  
- Extensible question modeling  
- Robust attempt state management  

This project addresses these issues by implementing a modular, extensible, and well-structured backend using object-oriented principles and system design practices.

---

## 3. Target Users

### Student
- Attempt exams  
- View results and analytics  
- Receive warnings during suspicious activity  

### Teacher
- Create and manage exams  
- Add different question types  
- Publish exams  
- Evaluate subjective answers  
- View performance analytics  

### Admin
- Manage users  
- Monitor suspicious attempts  
- Access system logs  

---

## 4. Core Features

### 4.1 Authentication & Authorization
- Role-based access control (Student, Teacher, Admin)  
- Secure login and token-based authentication  
- Password hashing  
- Protected API routes  

---

### 4.2 Exam Management
- Create exam with title, duration, start/end time  
- Set maximum attempts  
- Configure passing criteria  
- Publish/unpublish exam  
- Restrict modifications after publishing  

---

### 4.3 Question Management

Supports multiple question types:

#### MCQ
- Single or multiple correct answers  
- Auto-evaluated  

#### Subjective
- Text-based answer  
- Requires manual grading  

#### Coding
- Starter code  
- Multiple test cases  
- Auto-evaluated using test case comparison  

The system is designed using abstraction and polymorphism so new question types can be added easily.

---

### 4.4 Exam Attempt System

- Eligibility validation before attempt  
- Server-controlled timer  
- Auto-save responses  
- Manual submission  
- Auto-submit on timeout  
- Prevent concurrent duplicate attempts  

Each attempt follows a defined state machine:

- NOT_STARTED  
- IN_PROGRESS  
- SUBMITTED  
- AUTO_SUBMITTED  
- EVALUATED  

---

### 4.5 Evaluation Engine

- Polymorphic evaluation logic per question type  
- Strategy-based scoring system  
- Automatic score aggregation  
- Support for negative marking (optional)  
- Manual grading for subjective responses  

---

### 4.6 Proctoring System

- Tab switching detection  
- Page refresh tracking  
- Multiple login detection  
- Suspicious event logging  
- Violation threshold system  
- Attempt flagging  

All events are stored with timestamp and attempt reference.

---

### 4.7 Analytics & Reporting

#### Student Dashboard
- Exam history  
- Average score  
- Performance trends  

#### Teacher Dashboard
- Exam-wise analytics  
- Question-wise difficulty analysis  
- Pass percentage  

#### Admin Dashboard
- Suspicious activity summary  
- System usage metrics  

---

## 5. Backend Architecture Focus

This project emphasizes backend engineering practices:

- Layered architecture (Controller → Service → Repository)  
- Clear separation of concerns  
- DTO validation  
- Role-based middleware  
- Transaction management  
- Concurrency-safe attempt handling  

---

## 6. Object-Oriented Design Principles

### Encapsulation
Evaluation and scoring logic is contained within the service layer.

### Abstraction
An abstract `Question` class defines common behavior for all question types.

### Inheritance
A base `User` class is extended by `Student`, `Teacher`, and `Admin`.

### Polymorphism
Each question type overrides the `evaluate()` method differently.

---

## 7. Design Patterns Used

- Strategy Pattern → Evaluation logic  
- Factory Pattern → Question creation  
- State Pattern → Attempt state management  
- Observer Pattern → Proctoring event notifications  

---

## 8. Database Design

Core entities:

- Users  
- Exams  
- Questions  
- Attempts  
- Submissions  
- Proctor Logs  
- Coding Test Cases  

Relational integrity is maintained using foreign keys and constraints.

---

## 9. Scope of Milestone-1

For this milestone:

- Finalize system scope  
- Design Use Case Diagram  
- Design Sequence Diagram  
- Design Class Diagram  
- Design ER Diagram  

Implementation will begin after proper architectural modeling.

---

## 10. Expected Outcome

By completing this project, the system will demonstrate:

- Strong object-oriented modeling  
- Real-world system design practices  
- Extensible backend architecture  
- Secure exam workflow handling  
- Clean separation of layers  
- Maintainable and scalable codebase  