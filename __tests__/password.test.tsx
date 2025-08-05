/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PasswordPage from "../src/app/password/page";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("PasswordPage", () => {
  it.skip("should render all password fields", () => {
    render(<PasswordPage />);

    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update Password/i })
    ).toBeInTheDocument();
  });

  it.skip("should show error when new password is too short", async () => {
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

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  it.skip("should show error when passwords don't match", () => {
    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it.skip("should toggle current password visibility", () => {
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

  it.skip("should toggle new password visibility", () => {
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

  it("should render password page", () => {
    render(<PasswordPage />);
    expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
  });

  it.skip("should submit valid form and make API call", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Password updated successfully" }),
    } as Response);

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "currentpass",
          newPassword: "newpassword123",
        }),
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Password updated successfully/i)
      ).toBeInTheDocument();
    });
  });

  it.skip("should handle API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Current password is incorrect" }),
    } as Response);

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Current password is incorrect/i)
      ).toBeInTheDocument();
    });
  });

  it.skip("should handle network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: "currentpass" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/An error occurred. Please try again/i)
      ).toBeInTheDocument();
    });
  });

  it.skip("should reset form after successful submission", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Password updated successfully" }),
    } as Response);

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
      target: { value: "newpassword123" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    await waitFor(() => {
      expect(currentPasswordInput.value).toBe("");
      expect(newPasswordInput.value).toBe("");
      expect(confirmPasswordInput.value).toBe("");
    });
  });
});
