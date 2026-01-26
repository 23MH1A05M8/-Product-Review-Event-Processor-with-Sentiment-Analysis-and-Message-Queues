const amqp = require("amqplib");
const settings = require("../config/settings");

let channel;

/**
 * Initialize RabbitMQ publisher channel (CONFIRM channel)
 */
async function initPublisher() {
  if (channel) return channel;

  const connection = await amqp.connect(settings.rabbitmqUrl);

  // 👇 IMPORTANT FIX
  channel = await connection.createConfirmChannel();

  await channel.assertQueue(settings.outputQueue, { durable: true });

  console.log("✅ RabbitMQ publisher initialized (confirm channel)");
  return channel;
}

/**
 * Publish ReviewProcessed event
 */
async function publishProcessedReview(event) {
  const publisherChannel = await initPublisher();

  return new Promise((resolve, reject) => {
    publisherChannel.sendToQueue(
      settings.outputQueue,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
      (err) => {
        if (err) {
          console.error("❌ Failed to publish ReviewProcessed event:", err);
          reject(err);
        } else {
          console.log("📤 ReviewProcessed event published:", event.reviewId);
          resolve();
        }
      }
    );
  });
}

module.exports = { publishProcessedReview };
