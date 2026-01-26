function validateReviewEvent(event) {
  if (!event.reviewId || typeof event.reviewId !== "string")
    return "Invalid or missing reviewId";

  if (!event.productId || typeof event.productId !== "string")
    return "Invalid or missing productId";

  if (!event.userId || typeof event.userId !== "string")
    return "Invalid or missing userId";

  if (
    typeof event.rating !== "number" ||
    event.rating < 1 ||
    event.rating > 5
  )
    return "Rating must be a number between 1 and 5";

  if (!event.comment || typeof event.comment !== "string")
    return "Invalid or missing comment";

  if (!event.timestamp || isNaN(Date.parse(event.timestamp)))
    return "Invalid or missing timestamp";

  return null; // means valid
}

module.exports = { validateReviewEvent };
