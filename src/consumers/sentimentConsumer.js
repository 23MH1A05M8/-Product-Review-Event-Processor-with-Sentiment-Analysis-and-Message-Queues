const amqp = require("amqplib");
const settings = require("../config/settings");
const { saveSentiment } = require("../models/sentimentModel");

async function connectWithRetry() {
  while (true) {
    try {
      const connection = await amqp.connect(settings.rabbitmqUrl);
      console.log("✅ Sentiment Consumer connected to RabbitMQ");
      return connection;
    } catch (err) {
      console.log("⏳ Waiting for RabbitMQ...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

async function startSentimentConsumer() {
  const connection = await connectWithRetry();
  const channel = await connection.createChannel();

  await channel.assertQueue(settings.sentimentQueue, { durable: true });

  console.log("📥 Waiting for sentiment events...");

  channel.consume(settings.sentimentQueue, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());

      console.log("🧠 Sentiment event received:", event);

      await saveSentiment(event);

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Failed to process sentiment:", err.message);
      channel.ack(msg);
    }
  });
}

module.exports = { startSentimentConsumer };
