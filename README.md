# Interview-AI (TeamSpark)

AI-powered mock interview and preparation platform for practicing Aptitude, Coding, Technical, HR, and Company-Specific rounds. Includes a deterministic Resume Analyzer with ATS score calculation, skill extraction, profile-driven question matching, and personalized interview performance feedback.

## Features

- **Resume Analyzer**: Instant, local, deterministic analysis tailored to the candidate's profile with ATS score, skill extraction, project highlights, strengths, weaknesses, and optimization recommendations.
- **Mock Interviews**:
  - **Aptitude Round**: Quantitative, logical, and verbal reasoning quiz with automated timer and grading.
  - **Coding Round**: In-browser Monaco code editor with multiple programming languages, test cases, and real-time execution feedback.
  - **Technical Round**: Role-based domain questions (Web Dev, Machine Learning, Data Science, etc.) with real-time speech-to-text recording.
  - **HR Round**: Behavioral and situational questions personalized to the candidate's resume and background.
  - **Company-Specific Practice**: Curated question banks and difficulty profiles for top tech companies (Google, Amazon, Microsoft, TCS, Infosys, etc.).
- **Anti-Cheating Proctoring View**: Face detection and tab switch monitoring during assessments.
- **Analytics & History**: Detailed round breakdowns, score graphs, strengths/weaknesses diagnosis, and retry options stored reliably in localStorage.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The application runs on `http://localhost:3000`.

### Building for Production

```bash
npm run build
```
