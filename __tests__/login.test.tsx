import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../src/app/login/page";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset fetch mock with default implementation
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Success" }),
    });
  });

  it("should render the login form", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(document.getElementById("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("should display error message when email is empty and form is submitted", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Leave email empty and enter a valid password
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for and check that the error message appears
    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
    });

    // Verify the error message has the correct styling
    const errorMessage = screen.getByText("Email is required.");
    expect(errorMessage).toHaveClass("text-red-600");
  });

  it("should display error message when email is empty after form submission", async () => {
    render(<LoginPage />);

    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Enter a valid password but leave email empty
    fireEvent.change(passwordInput, { target: { value: "validpassword" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for and check that the error message appears
    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
    });
  });

  it("should not display email error when email is provided", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Enter valid email and password
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait a moment to ensure any error messages would have appeared
    await waitFor(() => {
      expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
    });
  });

  it("should clear email error when user starts typing in email field", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Submit form with empty email to trigger error
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
    });

    // Start typing in email field
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit again - error should be gone
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
    });
  });

  it("should display error message when password is too short", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Enter valid email but short password
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "12345" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for and check that the password error message appears
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters.")
      ).toBeInTheDocument();
    });
  });

  it("should toggle password visibility when show/hide button is clicked", () => {
    render(<LoginPage />);

    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: "Show password" });

    // Initially password should be hidden
    expect(passwordInput.type).toBe("password");

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("should make API call on successful form submission", async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Login successful" }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Enter valid credentials
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
  });

  it("should handle API error on login failure", async () => {
    // Mock failed API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Enter credentials
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("should clear errors when user starts typing after validation error", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Login" });

    // Submit form with invalid data to trigger errors
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.click(submitButton);

    // Wait for errors to appear
    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
      expect(
        screen.getByText("Password must be at least 6 characters.")
      ).toBeInTheDocument();
    });

    // Fix the values
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit again - errors should be cleared
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Password must be at least 6 characters.")
      ).not.toBeInTheDocument();
    });
  });
});
