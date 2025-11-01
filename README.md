# Learning Management System (LMS)

A microservices-based Learning Management System built with Next.js (frontend) and Nest.js (backend services).

## TL;DR

### Build and Run

```bash
# Clone the repository
git clone <repository-url>
cd LMS

# Start all services with Docker Compose
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# LMS API: http://localhost:3001
# Similar Courses API: http://localhost:3002
```

### Test

```bash
# Test LMS API service
cd services/lms
npm install
npm test

# Test Similar Courses service
cd services/similar
npm install
npm test

# Test Frontend
cd frontend
npm install
npm test
```

## Architecture

This LMS is composed of three main components:

1. **LMS API Service** (Nest.js) - Manages courses, lessons, and user progress
2. **Similar Courses Service** (Nest.js) - Provides course similarity recommendations
3. **Frontend** (Next.js) - User interface for interacting with the system

All services use PostgreSQL databases and communicate via REST APIs.

## Prerequisites

- Docker and Docker Compose
- Node.js ≥ 18 (for local development)
- PostgreSQL 15+ (if running locally without Docker)

## Full Setup Instructions

### Using Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LMS
   ```

2. **Start all services**

   ```bash
   docker compose up --build
   ```

   This will:

   - Start two PostgreSQL databases (one for each service)
   - Build and start the LMS API service (port 3001)
   - Build and start the Similar Courses service (port 3002)
   - Build and start the Next.js frontend (port 3000)

3. **Access the application**
   - Frontend: http://localhost:3000
   - LMS API: http://localhost:3001
   - Similar Courses API: http://localhost:3002

### Local Development Setup

#### LMS API Service

```bash
cd services/lms
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL (or use Docker)
# docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine

# Run migrations (TypeORM will auto-sync in dev mode)
npm run start:dev
```

#### Similar Courses Service

```bash
cd services/similar
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and LMS_API_URL

# Start PostgreSQL (or use Docker)
# docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine

npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install

# Create .env.local file
NEXT_PUBLIC_LMS_API_URL=http://localhost:3001
NEXT_PUBLIC_SIMILAR_API_URL=http://localhost:3002

npm run dev
```

## API Specification

### LMS API Service (Port 3001)

#### Courses

- `GET /courses` - List all courses

  - Query params: `userId` (optional) - Include completion percentage
  - Response: Array of course objects with completion percentage

- `GET /courses/:id` - Get a specific course

  - Query params: `userId` (optional) - Include completion percentage
  - Response: Course object with completion percentage

- `POST /courses` - Create a new course

  - Body: `{ title: string, description?: string, tags?: string[], category?: string }`
  - Response: Created course object

- `PATCH /courses/:id` - Update a course

  - Body: Partial course object
  - Response: Updated course object

- `DELETE /courses/:id` - Delete a course
  - Response: 204 No Content

#### Lessons

- `GET /lessons` - List all lessons

  - Query params: `courseId` (optional) - Filter by course
  - Response: Array of lesson objects

- `GET /lessons/:id` - Get a specific lesson

  - Response: Lesson object

- `POST /lessons` - Create a new lesson

  - Body: `{ title: string, content?: string, orderIndex: number, courseId: string }`
  - Response: Created lesson object

- `PATCH /lessons/:id` - Update a lesson

  - Body: Partial lesson object
  - Response: Updated lesson object

- `DELETE /lessons/:id` - Delete a lesson

  - Response: 204 No Content

- `POST /lessons/:id/complete` - Mark a lesson as completed
  - Query params: `userId` (required) - User ID
  - Response: `{ message: "Lesson marked as completed" }`

#### Users

- `GET /users/:id/stats` - Get user learning statistics
  - Response: `{ totalCourses, totalLessons, completedLessons, completionPercentage, coursesInProgress }`

### Similar Courses Service (Port 3002)

#### Courses

- `GET /courses/:id/similar` - Get similar courses for a given course
  - Response: `{ courseId: string, similarCourses: Array<{ id, title, description, tags, category, similarityScore }> }`

### Similarity Algorithm

The similarity algorithm uses a heuristic approach:

1. **Category Match**: If courses share the same category, add 50 points
2. **Tag Overlap**: Each common tag adds 10 points
3. **Description Similarity**: Common words in descriptions add up to 30 points (max)
4. **Final Score**: Sum of all points, capped at 100

The algorithm returns the top 5 most similar courses, sorted by similarity score.

## API Examples

### Using curl

```bash
# Create a course
curl -X POST http://localhost:3001/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to TypeScript",
    "description": "Learn TypeScript fundamentals",
    "category": "Programming",
    "tags": ["typescript", "programming", "web"]
  }'

# Get all courses
curl http://localhost:3001/courses

# Get courses with completion percentage for a user
curl "http://localhost:3001/courses?userId=user-123"

# Create a lesson
curl -X POST http://localhost:3001/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TypeScript Basics",
    "content": "TypeScript is a typed superset of JavaScript...",
    "orderIndex": 1,
    "courseId": "<course-id>"
  }'

# Mark a lesson as completed
curl -X POST "http://localhost:3001/lessons/<lesson-id>/complete?userId=user-123"

# Get user statistics
curl http://localhost:3001/users/user-123/stats

# Get similar courses
curl http://localhost:3002/courses/<course-id>/similar
```

### Using HTTPie

```bash
# Create a course
http POST http://localhost:3001/courses \
  title="Introduction to TypeScript" \
  description="Learn TypeScript fundamentals" \
  category="Programming" \
  tags:='["typescript", "programming"]'

# Get all courses
http GET http://localhost:3001/courses

# Get similar courses
http GET http://localhost:3002/courses/<course-id>/similar
```

## Testing Instructions

### Backend Services

#### LMS API Service

```bash
cd services/lms
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run test:e2e      # E2E tests
```

#### Similar Courses Service

```bash
cd services/similar
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
```

### Frontend

```bash
cd frontend
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:e2e      # E2E tests (Playwright)
```

## Design Decisions

### Architecture

- **Microservices**: Separated LMS API and Similar Courses service for independent scaling and development
- **Clean Architecture**: Domain-driven design with clear separation of concerns (entities, repositories, services, controllers)
- **SOLID Principles**: Single responsibility, dependency inversion, and open/closed principles applied throughout

### Database Design

- **UUID Primary Keys**: All entities use UUID for primary keys for distributed system compatibility
- **TypeORM**: ORM used for database abstraction and migrations
- **Separate Databases**: Each service has its own PostgreSQL database for true microservice independence

### API Design

- **RESTful**: Standard REST conventions for resource management
- **Completion Percentage**: Calculated dynamically based on user's completed lessons
- **Similarity Service**: Decoupled service that calls LMS API to fetch course data

### Frontend

- **Next.js 14**: Using App Router for modern React patterns
- **Server-Side Rendering**: Course listing page uses SSR for better SEO and initial load performance
- **Client Components**: Interactive pages use client-side rendering for real-time updates

## Trade-offs and Future Work

### Current Trade-offs

1. **Default User**: Currently uses a hardcoded default user ID. In production, implement JWT authentication
2. **Similarity Algorithm**: Simple heuristic-based algorithm. Could be enhanced with ML-based recommendations
3. **Database Sync**: Similar Courses service reads from LMS API. For production, consider event-driven architecture with message queues
4. **No Pagination**: Course listing doesn't support pagination. Should be added for large datasets

### Future Enhancements

1. **Authentication**: Implement JWT-based authentication with user registration/login
2. **Pagination**: Add pagination and filtering to course listing
3. **Real-time Updates**: WebSocket support for live course progress updates
4. **Advanced Recommendations**: ML-based similarity algorithm using collaborative filtering
5. **Message Queue**: Async messaging (RabbitMQ/Kafka) for service decoupling
6. **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
7. **Caching**: Redis for frequently accessed data
8. **Rate Limiting**: API rate limiting and throttling
9. **Monitoring**: Prometheus and Grafana for observability
10. **Load Testing**: Performance testing and optimization

## Project Structure

```
LMS/
├── services/
│   ├── lms/                 # LMS API Service
│   │   ├── src/
│   │   │   ├── courses/     # Course module
│   │   │   ├── lessons/      # Lesson module
│   │   │   ├── users/        # User module
│   │   │   └── config/       # Configuration
│   │   ├── Dockerfile
│   │   └── package.json
│   └── similar/              # Similar Courses Service
│       ├── src/
│       │   └── courses/      # Similar courses logic
│       ├── Dockerfile
│       └── package.json
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   └── lib/              # API client
│   ├── Dockerfile
│   └── package.json
├── docs/                     # Documentation
│   └── diagram.svg           # Architecture diagram
├── docker-compose.yml        # Docker Compose configuration
└── README.md
```

## License

MIT
