```mermaid
ErDiagram

USERS {
    UUID id PK
    string name
    string email
    string password
    string role
}

EXAMS {
    UUID id PK
    string title
    int duration
    string status
    UUID teacher_id FK
}

QUESTIONS {
    UUID id PK
    UUID exam_id FK
    string type
    string text
    int marks
}

ATTEMPTS {
    UUID id PK
    UUID student_id FK
    UUID exam_id FK
    datetime start_time
    datetime end_time
    string status
    int total_score
}

SUBMISSIONS {
    UUID id PK
    UUID attempt_id FK
    UUID question_id FK
    string answer
    int score
}

PROCTOR_LOGS {
    UUID id PK
    UUID attempt_id FK
    string event_type
    datetime timestamp
}

CODING_TEST_CASES {
    UUID id PK
    UUID question_id FK
    string input
    string expected_output
}

USERS ||--o{ EXAMS : creates
USERS ||--o{ ATTEMPTS : attempts
EXAMS ||--o{ QUESTIONS : contains
EXAMS ||--o{ ATTEMPTS : has
ATTEMPTS ||--o{ SUBMISSIONS : includes
ATTEMPTS ||--o{ PROCTOR_LOGS : logs
QUESTIONS ||--o{ CODING_TEST_CASES : has
QUESTIONS ||--o{ SUBMISSIONS : answered_in
```