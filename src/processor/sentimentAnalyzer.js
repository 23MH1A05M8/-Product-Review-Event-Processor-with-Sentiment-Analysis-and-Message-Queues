function analyzeSentiment(comment) {
  const text = comment.toLowerCase();

  const positiveWords = ["good", "great", "excellent", "amazing", "love"];
  const negativeWords = ["bad", "terrible", "hate", "poor"];

  let score = 0;

  positiveWords.forEach(word => {
    if (text.includes(word)) score++;
  });

  negativeWords.forEach(word => {
    if (text.includes(word)) score--;
  });

  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}

module.exports = { analyzeSentiment };
