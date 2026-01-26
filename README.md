# Product Review Processor – Event-Driven Backend Service

## Project Overview
This project implements a production-ready, event-driven backend service for processing product review submissions asynchronously. The service consumes review events from a message queue, performs sentiment analysis, persists enriched data in a relational database, and publishes processed events to a downstream queue.

The system is designed using core distributed-system principles such as idempotent processing, retry handling, Dead-Letter Queue (DLQ) support, full containerization with Docker, and comprehensive unit and integration testing.

---

## Workflow Overview
1. Consume ProductReviewSubmitted events from RabbitMQ
2. Validate event schema
3. Perform sentiment analysis on the review comment
4. Persist enriched review data in PostgreSQL
5. Publish ReviewProcessed events to an output queue
6. Route failed messages to a Dead-Letter Queue after retries

---

## Architecture Overview (Event-Driven Flow)
1. ProductReviewSubmitted Event  
   Published to product_review_submitted_queue

2. Review Consumer  
   Consumes messages from RabbitMQ  
   Validates schema and forwards events for processing

3. Review Processor  
   Performs sentiment analysis  
   Ensures idempotency using reviewId  
   Stores processed review in PostgreSQL

4. ReviewProcessed Event  
   Published to review_processed_queue

5. Dead-Letter Queue (DLQ)  
   Messages exceeding retry attempts are routed to product_review_dlq

---

## Event Schemas

### ProductReviewSubmitted Event
{
  "reviewId": "rv_abc123",
  "productId": "prod_xyz456",
  "userId": "user_123",
  "rating": 5,
  "comment": "This product is absolutely amazing!",
  "timestamp": "2023-10-27T10:00:00Z"
}

### ReviewProcessed Event
{
  "reviewId": "rv_abc123",
  "sentiment": "Positive",
  "processedTimestamp": "2023-10-27T10:00:05Z"
}

---

## Sentiment Analysis
Sentiment analysis is implemented as a mock keyword-based classifier.

Positive keywords: love, great, excellent, amazing  
Negative keywords: bad, poor, hate  
Neutral sentiment is applied as the default case.

The sentiment logic is isolated into its own module and is verified using unit tests.

---

## Database Design (PostgreSQL)
Table Name: processed_reviews

CREATE TABLE IF NOT EXISTS processed_reviews (
  review_id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  sentiment VARCHAR(50) NOT NULL,
  processed_timestamp TIMESTAMPTZ NOT NULL
);

---

## Idempotency Strategy
The reviewId field is used as a unique identifier for each review.

Before inserting a record, the service checks whether the reviewId already exists in the database.  
If a duplicate event is received, processing is safely skipped.

This approach prevents duplicate database entries and ensures a consistent system state.  
Idempotency behavior is verified through integration tests.

---

## Error Handling, Retries & Dead-Letter Queue (DLQ)
The service implements a robust retry and DLQ strategy.

Transient failures such as temporary database or broker errors are retried automatically.  
Retry attempts are limited using the MAX_RETRIES environment variable.  
Retry counts are tracked to enforce bounded retries.

Messages that exceed the retry limit are routed to the Dead-Letter Queue (DLQ).  
All retry attempts, failures, and DLQ routing actions are logged for observability.

DLQ behavior is validated using integration tests.

---

## Testing Strategy

### Unit Tests (tests/unit)
Sentiment analysis logic  
Review processor core logic

### Integration Tests (tests/integration)
End-to-end message processing flow  
Database persistence verification  
Idempotency validation  
Dead-Letter Queue routing verification

All tests are executed inside Docker containers to closely match real runtime conditions.

---

## Docker & Containerization
The entire system is containerized using Docker and orchestrated with Docker Compose.

Services include:
- Application service
- RabbitMQ (with management UI)
- PostgreSQL database

This ensures a consistent and reproducible development and testing environment.

---

## Database Initialization
The PostgreSQL database does not automatically create tables on startup.

After starting Docker services, initialize the schema manually:

docker exec -it <postgres-container-name> psql -U user -d review_db

Then execute:

CREATE TABLE IF NOT EXISTS processed_reviews (
  review_id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  sentiment VARCHAR(50) NOT NULL,
  processed_timestamp TIMESTAMPTZ NOT NULL
);

Replace <postgres-container-name> with the actual container name shown by docker ps.

---

## Configuration
All configuration values are managed using environment variables.

Example .env file:

QUEUE_HOST=rabbitmq  
QUEUE_PORT=5672  
INPUT_QUEUE_NAME=product_review_submitted_queue  
OUTPUT_QUEUE_NAME=review_processed_queue  
DLQ_NAME=product_review_dlq  
DB_HOST=db  
DB_PORT=5432  
DB_USER=user  
DB_PASSWORD=password  
DB_NAME=review_db  
MAX_RETRIES=3  
LOG_LEVEL=info  

---

## How to Run

1. Build and start services
docker-compose down -v  
docker-compose up --build

2. Initialize the database schema  
Refer to the Database Initialization section.

3. Run tests
docker-compose exec app npm test

4. RabbitMQ Management UI
http://localhost:15672  
Username: guest  
Password: guest

---

## PROJECT STRUCTURE
-----------------
src/
 ├── config/
 ├── consumers/
 ├── processor/
 ├── publishers/
 ├── models/
 └── main.js
tests/
 ├── unit/
 └── integration/
Dockerfile
docker-compose.yml
.env.example
.env
README.md

---

## Conclusion
This project demonstrates a production-ready, event-driven backend service featuring idempotent message processing, robust retry handling with Dead-Letter Queue support, full Docker-based containerization, and comprehensive unit and integration testing.

The implementation follows real-world backend microservices best practices and fully satisfies the project requirements.
