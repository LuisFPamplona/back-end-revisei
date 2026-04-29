import { calculateGamification } from "./calculateGamification";

describe("calculateGamification", () => {
  it("should give full reward for topicCompleted", () => {
    const result = calculateGamification("topicCompleted", "explore", 600);

    expect(result).toEqual({
      gemReward: 1,
      experienceReward: 5,
    });
  });

  it("should give full reward for subjectCompleted", () => {
    const result = calculateGamification("subjectCompleted", "explore", 600);

    expect(result).toEqual({
      gemReward: 3,
      experienceReward: 20,
    });
  });

  it("should reduce rewards when source is user", () => {
    const result = calculateGamification("topicCompleted", "user", 600);

    expect(result).toEqual({
      gemReward: 0,
      experienceReward: 1,
    });
  });

  it("should reduce rewards when time is less than 600", () => {
    const result = calculateGamification("subjectCompleted", "explore", 500);

    expect(result).toEqual({
      gemReward: 0,
      experienceReward: 4,
    });
  });

  it("should reduce rewards when source is user and time is less than 600", () => {
    const result = calculateGamification("subjectCompleted", "user", 500);

    expect(result).toEqual({
      gemReward: 0,
      experienceReward: 4,
    });
  });

  it("should throw an error when action is invalid", () => {
    expect(() =>
      calculateGamification("invalidAction" as any, "explore", 600),
    ).toThrow("Invalid gamification action.");
  });
});
