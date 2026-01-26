jest.mock("../../src/models/reviewModel");
jest.mock("../../src/publishers/reviewPublisher");

const { processReview } = require("../../src/processor/reviewProcessor");
const { saveReview, checkIfReviewExists } = require("../../src/models/reviewModel");
const { publishProcessedReview } = require("../../src/publishers/reviewPublisher");

describe("Review Processor Idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("skips processing if review already exists", async () => {
    checkIfReviewExists.mockResolvedValue(true);

    await processReview({
      reviewId: "rv_1",
      productId: "p1",
      userId: "u1",
      rating: 5,
      comment: "great product"
    });

    expect(saveReview).not.toHaveBeenCalled();
    expect(publishProcessedReview).not.toHaveBeenCalled();
  });
});
