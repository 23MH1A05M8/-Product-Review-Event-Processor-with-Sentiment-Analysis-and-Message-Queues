const amqp = require("amqplib");

async function waitForMessage(channel, queue, timeout = 8000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const msg = await channel.get(queue, { noAck: true });
    if (msg) return msg;
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  throw new Error(`Timed out waiting for message in ${queue}`);
}

describe("DLQ Test", () => {
  test("invalid message goes to DLQ", async () => {
    const conn = await amqp.connect(
      `amqp://${process.env.QUEUE_USER}:${process.env.QUEUE_PASS}@${process.env.QUEUE_HOST}:${process.env.QUEUE_PORT}`
    );
    const channel = await conn.createChannel();

    await channel.assertQueue(process.env.DLQ_NAME, { durable: true });

    await channel.sendToQueue(
      process.env.INPUT_QUEUE_NAME,
      Buffer.from(JSON.stringify({ invalid: true })),
      { persistent: true }
    );

    const msg = await waitForMessage(channel, process.env.DLQ_NAME);

    expect(msg).not.toBeNull();

    await channel.close();
    await conn.close();
  }, 10000); // extra safety timeout
});
