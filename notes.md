# Interview Slot Booking API — Notes

## 1. What I Built

Built a REST API using Node.js and Express for managing interview slots.

- Recruiters can create interview slots.
- Recruiters and candidates can view slots according to their roles.
- Candidates can book available slots.
- Candidates can cancel their own bookings.
- Recruiters can cancel their own slots.
- Implemented slot overlap validation to prevent conflicting schedules.
- Used an in-memory repository to store slot data.
- Organized the project into controllers, routes, services, and repository layers.

## 2. What I Skipped

- Persistent database integration.
- Automated unit and integration tests.
- Swagger/OpenAPI documentation.
- Postman collection.

## 3. Assumptions Made

- Authentication is simulated using `x-user-id` and `x-user-role` request headers.
- Only two roles are supported: `recruiter` and `candidate`.
- Slot duration must be between 15 and 120 minutes.
- Slots belonging to the same recruiter cannot overlap.
- Candidates cannot have overlapping bookings.
- A slot cannot be booked or cancelled within two hours of its start time.
- Data is stored in memory and resets when the server restarts.
- Back-to-back slots are allowed.

## 4. AI Usage

AI was used for guidance on project structure, understanding implementation approaches, and debugging during development. I reviewed and adapted the implementation.

## 5. What I Would Do Next

- Add database persistence using MongoDB.
- Implement automated tests for API endpoints and edge cases.
- Add Swagger/OpenAPI documentation.
- Create a Postman collection with positive and negative test cases.
- Improve authentication and authorization with proper token-based authentication.
- Handle concurrency safely across multiple server instances.
- add features like rescheduling booking slots and email notifications.