# Update-Profile: A Fullstack Next.js Project

[![CI/CD Pipeline](https://github.com/MawarListra/binar-module-5-assignment-11/actions/workflows/test.yml/badge.svg)](https://github.com/MawarListra/binar-module-5-assignment-11/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/MawarListra/binar-module-5-assignment-11/branch/main/graph/badge.svg)](https://codecov.io/gh/MawarListra/binar-module-5-assignment-11)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Project Description

This project is a sample full-stack application built with Next.js (App Router). It includes a simple frontend with login and profile update forms, a mock backend with API routes, and a complete testing and CI/CD setup.

## How to Run the Project

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd update-profile
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

    _Note: If you had issues with the automated dependency installation, you may need to install the testing libraries manually:_

    ```bash
    npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your local configuration if needed.

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

5.  **Run tests:**

    ```bash
    npm test
    ```

    To run tests with coverage, use:

    ```bash
    npm test -- --coverage
    ```

6.  **View Code Coverage Report:**
    After running the coverage command, an interactive HTML report is generated. To view it, open the following file in your browser:
    ```
    coverage/lcov-report/index.html
    ```
    This report provides a line-by-line view of which code is covered by your tests, similar to `go tool cover`.

## Folder Structure

```
update-profile/
├── .github/
│   └── workflows/
│       └── test.yml      # GitHub Actions workflow for CI
├── __tests__/             # Jest test files
│   ├── api-password.test.ts
│   ├── api-profile.test.ts
│   ├── login.test.tsx
│   └── profile.test.tsx
├── src/
│   └── app/
│       ├── api/          # API routes
│       │   ├── login/
│       │   ├── password/
│       │   └── profile/
│       ├── login/        # Login page
│       └── profile/      # Profile page
├── .env.example          # Example environment variables
├── .gitignore
├── codecov.yml           # Codecov configuration
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup file
├── next.config.js
├── package.json
└── README.md
```

## Role Breakdown

- **Frontend (FE):**

  - Responsible for the UI and client-side logic.
  - Files: `src/app/login/page.tsx`, `src/app/profile/page.tsx`

- **Backend (BE):**

  - Responsible for the API endpoints and server-side logic.
  - Files: `src/app/api/login/route.ts`, `src/app/api/profile/route.ts`, `src/app/api/password/route.ts`

- **QA (Quality Assurance):**

  - Drives the testing strategy and defines test cases.
  - The `api-password` route is an example of QA-driven development, where tests are created before the implementation.

- **DevOps:**
  - Manages the CI/CD pipeline and deployment processes.
  - Files: `.github/workflows/test.yml`, `codecov.yml`

## CI/CD and Coverage

- **Continuous Integration (CI):** The project uses GitHub Actions to run tests automatically on every push and pull request to the `main` branch. The workflow is defined in `.github/workflows/test.yml`.
- **Code Coverage:** Code coverage is generated on each test run and uploaded to Codecov. This helps in tracking the quality of the tests and ensuring that new code is adequately tested. The `codecov.yml` file configures how coverage is reported.

### CI/CD Setup Instructions

#### 1. GitHub Actions Configuration

The GitHub Actions workflow (`.github/workflows/test.yml`) includes:

- **Multi-Node Testing:** Tests on Node.js versions 18 and 20
- **Code Quality:** Runs ESLint for code linting
- **Test Coverage:** Runs tests with coverage reporting
- **Coverage Threshold:** Ensures minimum 90% test coverage
- **Build Verification:** Verifies the application builds successfully
- **Notifications:** Sends Telegram notifications on success/failure

#### 2. CodeCov Integration Setup

To enable CodeCov integration:

1. **Create CodeCov Account:**

   - Go to [codecov.io](https://codecov.io)
   - Sign up with your GitHub account
   - Add your repository to CodeCov

2. **Get CodeCov Token:**

   - In CodeCov dashboard, go to your repository settings
   - Copy the repository upload token

3. **Add GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and Variables → Actions
   - Add the following secrets:
     ```
     CODECOV_TOKEN: <your-codecov-token>
     ```

#### 3. Telegram Notifications Setup (Optional)

To enable Telegram notifications:

1. **Create Telegram Bot:**

   - Message `@BotFather` on Telegram
   - Create a new bot with `/newbot`
   - Save the bot token

2. **Get Chat ID:**

   - Add your bot to a group or get your personal chat ID
   - Use `@userinfobot` to get chat ID

3. **Add GitHub Secrets:**
   ```
   TELEGRAM_BOT_TOKEN: <your-bot-token>
   TELEGRAM_CHAT_ID: <your-chat-id>
   ```

#### 4. Coverage Requirements

- **Minimum Coverage:** 90% overall coverage required
- **Coverage Reports:** Generated in `coverage/` directory
- **HTML Report:** Available at `coverage/lcov-report/index.html`
- **Badge:** Shows current coverage status in README

## Notes

- **Purpose:** This project serves as a template or a starting point for building full-stack Next.js applications with a focus on best practices for testing and CI/CD.
- **Extensibility:** The project can be easily extended by adding more pages, API routes, and components. The existing structure provides a clear separation of concerns, making it scalable for larger applications.
