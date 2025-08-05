/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PasswordPage from "@/app/password/page";

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

describe("PasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Success" }),
    });
  });

  it("should render all password fields", () => {
    render(<PasswordPage />);

    expect(
      screen.getByRole("heading", { name: "Change Password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update Password/i })
    ).toBeInTheDocument();
  });

  it("should show validation errors for empty fields", async () => {
    render(<PasswordPage />);

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    expect(
      await screen.findByText(/Current password is required/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/New password is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Confirm password is required/i)
    ).toBeInTheDocument();
  });

  it("should show error when new password is too short", async () => {
    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    expect(
      await screen.findByText(/Password must be at least 6 characters/i)
    ).toBeInTheDocument();
  });

  it("should show error when passwords don't match", async () => {
    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "differentpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("should toggle current password visibility", () => {
    render(<PasswordPage />);

    const currentPasswordInput = screen.getByLabelText(
      /Current Password/i
    ) as HTMLInputElement;
    const toggleButton = screen.getByRole("button", {
      name: /Show current password/i,
    });

    expect(currentPasswordInput.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(currentPasswordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(currentPasswordInput.type).toBe("password");
  });

  it("should toggle new password visibility", () => {
    render(<PasswordPage />);

    const newPasswordInput = screen.getByLabelText(
      /New Password/i
    ) as HTMLInputElement;
    const toggleButton = screen.getByRole("button", {
      name: /Show new password/i,
    });

    expect(newPasswordInput.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(newPasswordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(newPasswordInput.type).toBe("password");
  });

  it("should toggle confirm password visibility", () => {
    render(<PasswordPage />);

    const confirmPasswordInput = screen.getByLabelText(
      /Confirm New Password/i
    ) as HTMLInputElement;
    const toggleButton = screen.getByRole("button", {
      name: /Show confirm password/i,
    });

    expect(confirmPasswordInput.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(confirmPasswordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(confirmPasswordInput.type).toBe("password");
  });

  it("should submit valid form and make API call", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password updated successfully" }),
    });

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "currentpass",
          newPassword: "newpass123",
          confirmPassword: "newpass123",
        }),
      });
    });
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Current password is incorrect" }),
    });

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("should reset form after successful submission", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password updated successfully" }),
    });

    render(<PasswordPage />);

    const currentPasswordInput = screen.getByLabelText(
      /Current Password/i
    ) as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(
      /New Password/i
    ) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      /Confirm New Password/i
    ) as HTMLInputElement;

    fireEvent.change(currentPasswordInput, {
      target: { value: "currentpass" },
    });
    fireEvent.change(newPasswordInput, {
      target: { value: "newpass123" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newpass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check if form is reset (in a real scenario, we'd check the actual values)
    await waitFor(() => {
      expect(currentPasswordInput.value).toBe("");
      expect(newPasswordInput.value).toBe("");
      expect(confirmPasswordInput.value).toBe("");
    });
  });
});
