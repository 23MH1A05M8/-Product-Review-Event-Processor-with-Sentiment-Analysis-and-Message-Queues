const amqp = require("amqplib");
const pool = require("../../src/config/db");

const INPUT_QUEUE = process.env.INPUT_QUEUE_NAME;
const OUTPUT_QUEUE = process.env.OUTPUT_QUEUE_NAME;

/**
 * Wait until DB record appears (polling)
 */
async function waitForDbRecord(pool, reviewId, timeout = 8000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await pool.query(
      "SELECT * FROM processed_reviews WHERE review_id=$1",
      [reviewId]
    );

    if (result.rowCount > 0) {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, 400));
  }

  throw new Error("Timed out waiting for DB insert");
}

/**
 * Wait until message appears in queue (polling)
 */
async function waitForQueueMessage(channel, queue, timeout = 8000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const msg = await channel.get(queue, { noAck: true });
    if (msg) return msg;
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  throw new Error("Timed out waiting for queue message");
}

describe("Review Processing Integration Test", () => {
  let connection;
  let channel;

  beforeAll(async () => {
    connection = await amqp.connect(
      `amqp://${process.env.QUEUE_USER}:${process.env.QUEUE_PASS}@${process.env.QUEUE_HOST}:${process.env.QUEUE_PORT}`
    );
    channel = await connection.createChannel();
  });

  afterAll(async () => {
    await channel.close();
    await connection.close();
    await pool.end();
  });

  test(
    "processes review, stores in DB, publishes event",
    async () => {
      const reviewEvent = {
        reviewId: "rv_int_1",
        productId: "prod_1",
        userId: "user_1",
        rating: 5,
        comment: "excellent product",
        timestamp: new Date().toISOString()
      };

      // Send input event
      await channel.assertQueue(INPUT_QUEUE, { durable: true });
      await channel.sendToQueue(
        INPUT_QUEUE,
        Buffer.from(JSON.stringify(reviewEvent)),
        { persistent: true }
      );

      // Verify DB insert
      const dbResult = await waitForDbRecord(pool, reviewEvent.reviewId);
      expect(dbResult.rowCount).toBe(1);

      // Verify output event
      await channel.assertQueue(OUTPUT_QUEUE, { durable: true });
      const msg = await waitForQueueMessage(channel, OUTPUT_QUEUE);
      const outputEvent = JSON.parse(msg.content.toString());

      expect(outputEvent.reviewId).toBe(reviewEvent.reviewId);
      expect(outputEvent.sentiment).toBe("Positive");
    },
    10000 // Jest timeout
  );
});
