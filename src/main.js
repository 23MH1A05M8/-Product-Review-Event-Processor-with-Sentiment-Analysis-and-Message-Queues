require("dotenv").config();
// const express = require("express");
const { startConsumer } = require("./consumers/reviewConsumer");
const { startProcessedReviewConsumer } = require("./consumers/processedReviewConsumer");

(async () => {
  try {
    await startConsumer();

    // ❌ DO NOT start output consumer during tests
    if (process.env.NODE_ENV !== "test") {
      await startProcessedReviewConsumer();
    }

  } catch (err) {
    console.error("❌ Consumer failed to start:", err);
    process.exit(1);
  }
})();

