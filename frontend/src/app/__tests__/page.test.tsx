import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Mock the API function
jest.mock("@/lib/api", () => ({
  getCourses: jest.fn(() =>
    Promise.resolve([
      {
        id: "1",
        title: "Test Course",
        description: "Test Description",
        completionPercentage: 50,
      },
    ])
  ),
}));

describe("Home Page", () => {
  it("renders course list", async () => {
    const page = await Home();
    render(page);

    expect(screen.getByText("Available Courses")).toBeInTheDocument();
    expect(screen.getByText("Test Course")).toBeInTheDocument();
  });
});
