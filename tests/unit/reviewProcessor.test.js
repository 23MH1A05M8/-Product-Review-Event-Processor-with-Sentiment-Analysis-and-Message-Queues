// const { analyzeSentiment } = require("../../src/processor/reviewProcessor");
const { analyzeSentiment } = require("../../src/processor/sentimentAnalyzer");


describe("Sentiment Analysis", () => {
  test("should return Positive sentiment", () => {
    const comment = "This product is excellent and amazing";
    const result = analyzeSentiment(comment);
    expect(result).toBe("Positive");
  });

  test("should return Negative sentiment", () => {
    const comment = "This product is terrible and bad";
    const result = analyzeSentiment(comment);
    expect(result).toBe("Negative");
  });

  test("should return Neutral sentiment", () => {
    const comment = "This product is okay";
    const result = analyzeSentiment(comment);
    expect(result).toBe("Neutral");
  });
});
