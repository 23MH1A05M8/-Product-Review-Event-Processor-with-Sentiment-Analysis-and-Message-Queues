const pool = require("../config/db");

async function checkIfReviewExists(reviewId) {
  const result = await pool.query(
    "SELECT 1 FROM processed_reviews WHERE review_id = $1",
    [reviewId]
  );
  return result.rowCount > 0;
}

async function saveReview(review) {
  const {
    reviewId,
    productId,
    userId,
    rating,
    comment,
    sentiment,
    processedTimestamp
  } = review;

  try {
    await pool.query(
      `INSERT INTO processed_reviews 
       (review_id, product_id, user_id, rating, comment, sentiment, processed_timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        reviewId,
        productId,
        userId,
        rating,
        comment,
        sentiment,
        processedTimestamp
      ]
    );

    console.log("💾 Review saved:", reviewId);
  } catch (error) {
    console.error("❌ DB insert failed:", error.message);
    throw error;
  }
}

module.exports = {
  saveReview,
  checkIfReviewExists
};
