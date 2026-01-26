const pool = require("../config/db");

async function saveSentiment(event) {
  const query = `
    INSERT INTO review_sentiments
    (review_id, product_id, user_id, sentiment, rating, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
  `;

  const values = [
    event.reviewId,
    event.productId,
    event.userId,
    event.sentiment,
    event.rating,
  ];

  await pool.query(query, values);
}

module.exports = { saveSentiment };
