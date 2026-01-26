require("dotenv").config();

module.exports = {
  rabbitmqUrl: process.env.RABBITMQ_URL,
  inputQueue: process.env.INPUT_QUEUE_NAME,
  outputQueue: process.env.OUTPUT_QUEUE_NAME,
  dlqQueue: process.env.DLQ_NAME,
  maxRetries: Number(process.env.MAX_RETRIES || 3)
};
