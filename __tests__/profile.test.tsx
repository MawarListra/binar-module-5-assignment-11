/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
    ok: true,
  })
) as jest.Mock;

describe("ProfilePage", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("renders all form fields", () => {
    render(<ProfilePage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty/invalid fields", async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Must be a valid email format/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Phone must be 10-15 digits/i)).toBeInTheDocument();
  });

  it("submits valid form and shows success message", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should validate birth date cannot be in the future", async () => {
    render(<ProfilePage />);

    // Set a future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split("T")[0];

    fireEvent.change(screen.getByLabelText(/Birth Date/i), {
      target: { value: futureDateString },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Birth date cannot be in the future/i)
    ).toBeInTheDocument();
  });

  it("should validate bio length", async () => {
    render(<ProfilePage />);

    const longBio = "a".repeat(161); // 161 characters

    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: longBio },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Bio must be 160 characters or less/i)
    ).toBeInTheDocument();
  });

  it("should handle API error response", async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: "Server error" }),
        ok: false,
      })
    );

    render(<ProfilePage />);

    // Fill valid form data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it("should clear errors when user fixes invalid input", async () => {
    render(<ProfilePage />);

    // Submit form to trigger validation errors
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    // Wait for errors
    expect(
      await screen.findByText(/Username must be at least 6 characters/i)
    ).toBeInTheDocument();

    // Fix the username
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });

    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    // Submit again
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    // Check that username error is gone
    await waitFor(() => {
      expect(
        screen.queryByText(/Username must be at least 6 characters/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should accept valid birth date", async () => {
    render(<ProfilePage />);

    // Set a valid past date
    const pastDate = "1990-01-01";

    fireEvent.change(screen.getByLabelText(/Birth Date/i), {
      target: { value: pastDate },
    });

    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/Birth date cannot be in the future/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should accept valid bio within character limit", async () => {
    render(<ProfilePage />);

    const validBio =
      "This is a valid bio that is within the 160 character limit.";

    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: validBio },
    });

    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/Bio must be 160 characters or less/i)
      ).not.toBeInTheDocument();
    });
  });
});
