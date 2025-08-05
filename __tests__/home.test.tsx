/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import HomePage from "../src/app/page";

describe("HomePage", () => {
  it("should render home page", () => {
    render(<HomePage />);
    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
  });
});
