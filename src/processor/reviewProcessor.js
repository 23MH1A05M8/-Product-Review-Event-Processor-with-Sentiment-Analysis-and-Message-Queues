const { saveReview, checkIfReviewExists } = require("../models/reviewModel");
const { analyzeSentiment } = require("./sentimentAnalyzer");
const { publishProcessedReview } = require("../publishers/reviewPublisher");

/**
 * Idempotent processing of ProductReviewSubmitted event
 */
async function processReview(event) {
  try {
    // 1️⃣ Idempotency check
    const alreadyProcessed = await checkIfReviewExists(event.reviewId);

    if (alreadyProcessed) {
      console.log(
        "⚠️ Duplicate review detected. Skipping:",
        event.reviewId
      );
      return;
    }

    // 2️⃣ Sentiment analysis
    const sentiment = analyzeSentiment(event.comment);

    // 3️⃣ Build enriched review object
    const processedReview = {
      reviewId: event.reviewId,
      productId: event.productId,
      userId: event.userId,
      rating: event.rating,
      comment: event.comment,
      sentiment,
      processedTimestamp: new Date().toISOString()
    };

    // 4️⃣ Persist to database
    await saveReview(processedReview);

    // 5️⃣ Publish ReviewProcessed event
    await publishProcessedReview({
      reviewId: processedReview.reviewId,
      sentiment: processedReview.sentiment,
      processedTimestamp: processedReview.processedTimestamp
    });

    console.log(
      "✅ Review processed successfully:",
      processedReview.reviewId
    );
  } catch (error) {
    console.error(
      "❌ Error processing review:",
      event.reviewId,
      error.message
    );
    throw error; // REQUIRED for retry & DLQ handling
  }
}

module.exports = {
  processReview
};
