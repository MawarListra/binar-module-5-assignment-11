/**
 * @jest-environment node
 */
import { POST } from "@/app/api/password/route";

describe("/api/password", () => {
  it("should update password with valid data", async () => {
    const request = new Request("http://localhost:3000/api/password", {
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

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Password updated successfully");
  });

  it("should return error when fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "currentpass",
        newPassword: "",
        confirmPassword: "",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("All fields are required");
  });

  it("should return error when passwords don't match", async () => {
    const request = new Request("http://localhost:3000/api/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "currentpass",
        newPassword: "newpass123",
        confirmPassword: "differentpass",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("New passwords do not match");
  });

  it("should return error when new password is too short", async () => {
    const request = new Request("http://localhost:3000/api/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "currentpass",
        newPassword: "123",
        confirmPassword: "123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Password must be at least 6 characters");
  });

  it("should return error when current password is incorrect", async () => {
    const request = new Request("http://localhost:3000/api/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "wrongpass",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Current password is incorrect");
  });

  it("should handle malformed JSON", async () => {
    const request = new Request("http://localhost:3000/api/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Internal server error");
  });
});
