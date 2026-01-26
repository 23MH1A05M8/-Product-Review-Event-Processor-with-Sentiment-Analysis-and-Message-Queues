const amqp = require("amqplib");
const pool = require("../../src/config/db");

describe("Idempotency Integration Test", () => {
  test("does not insert duplicate reviews", async () => {
    const conn = await amqp.connect(
      `amqp://${process.env.QUEUE_USER}:${process.env.QUEUE_PASS}@${process.env.QUEUE_HOST}:${process.env.QUEUE_PORT}`
    );
    const channel = await conn.createChannel();

    const event = {
      reviewId: "rv_dup_1",
      productId: "p1",
      userId: "u1",
      rating: 4,
      comment: "good product",
      timestamp: new Date().toISOString()
    };

    await channel.sendToQueue(
      process.env.INPUT_QUEUE_NAME,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );

    await channel.sendToQueue(
      process.env.INPUT_QUEUE_NAME,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );

    await new Promise(resolve => setTimeout(resolve, 4000));

    const result = await pool.query(
      "SELECT COUNT(*) FROM processed_reviews WHERE review_id=$1",
      [event.reviewId]
    );

    expect(Number(result.rows[0].count)).toBe(1);

    await channel.close();
    await conn.close();
  });
});
