const { analyzeSentiment } = require("../../src/processor/sentimentAnalyzer");

describe("Sentiment Analyzer", () => {
  test("returns Positive for positive comment", () => {
    const result = analyzeSentiment("This product is great and amazing");
    expect(result).toBe("Positive");
  });

  test("returns Negative for negative comment", () => {
    const result = analyzeSentiment("This is a bad and terrible product");
    expect(result).toBe("Negative");
  });

  test("returns Neutral for neutral comment", () => {
    const result = analyzeSentiment("The product is okay");
    expect(result).toBe("Neutral");
  });
});
