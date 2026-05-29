# Database Migration

Owner: Agent 2

## Scope

Provide Go database access while preserving existing MySQL tables.

## Current Tables

- `ah_manager`
- `ah_student`
- `ah_student_textbook_config`
- `ah_ability`
- `ah_textbook`
- `ah_textbook_version`
- `ah_unit`
- `ah_teacher_book`
- `ah_question_type`
- `ah_question`
- `ah_practice`
- `ah_practice_answer`
- `ah_practice_report`
- `ah_student_ability_mastery`

## Rules

- Do not change existing table structure during early migration.
- Prefer explicit SQL over ORM-style hidden behavior.
- Any destructive migration requires architecture review.

