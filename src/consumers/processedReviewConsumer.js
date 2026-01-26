const amqp = require("amqplib");
const settings = require("../config/settings");

async function startProcessedReviewConsumer() {
  const connection = await amqp.connect(settings.rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(settings.outputQueue, { durable: true });

  console.log("📡 Waiting for processed reviews...");

  channel.consume(settings.outputQueue, (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());

    console.log("📦 Processed Review Received:", event);

    // Here later DB / analytics / notification logic can be added

    channel.ack(msg);
  });
}

module.exports = { startProcessedReviewConsumer };
