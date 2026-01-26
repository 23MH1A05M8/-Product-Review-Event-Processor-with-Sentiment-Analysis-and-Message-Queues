const amqp = require("amqplib");
const settings = require("../config/settings");
const { validateReviewEvent } = require("./eventValidator");
const { processReview } = require("../processor/reviewProcessor");

let connection;
let channel;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  while (true) {
    try {
      console.log("🔄 Connecting to RabbitMQ...");
      const conn = await amqp.connect(settings.rabbitmqUrl);
      console.log("✅ Connected to RabbitMQ");
      return conn;
    } catch (err) {
      console.log("⏳ RabbitMQ not ready, retrying in 5 seconds...");
      await sleep(5000);
    }
  }
}

async function startConsumer() {
  connection = await connectWithRetry();
  channel = await connection.createChannel();

  await channel.prefetch(1);

  await channel.assertQueue(settings.inputQueue, { durable: true });
  await channel.assertQueue(settings.outputQueue, { durable: true });
  await channel.assertQueue(settings.dlqQueue, { durable: true });

  console.log("📩 Waiting for messages...");

  channel.consume(settings.inputQueue, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());

      const error = validateReviewEvent(event);
      if (error) throw new Error(error);

      await processReview(event);
      channel.ack(msg);

    } catch (err) {
      console.error("❌ Processing failed:", err.message);

      await channel.sendToQueue(
        settings.dlqQueue,
        msg.content,
        {
          headers: { "x-error": err.message },
          persistent: true
        }
      );

      channel.ack(msg);
    }
  });
}

async function stopConsumer() {
  if (channel) await channel.close();
  if (connection) await connection.close();
  console.log("🛑 RabbitMQ consumer stopped");
}

module.exports = {
  startConsumer,
  stopConsumer
};
