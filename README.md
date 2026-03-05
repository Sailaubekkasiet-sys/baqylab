<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

# BaqyLab — Next-generation IT Education 🎓

> Modern LMS platform for teaching Computer Science — with rubric builder, inline code review, Git-style submission versioning, skill maps, and an AI assistant.

<p align="center">
  <b>🌐 Languages:</b> Русский · Қазақша · English
</p>

---

## ✨ Key Features

### For Teachers
| Feature | Description |
|---|---|
| 🏫 **Class Management** | Create classes, share invite codes, manage students |
| 📋 **Rubric Builder** | Design grading criteria with point scales and descriptions |
| 💬 **Code Review** | Leave inline comments on specific lines of student code |
| 📊 **Analytics Dashboard** | Track student progress, identify weak topics, detect risks |
| 🏆 **Best Solutions Gallery** | Highlight exemplary student work |
| 👥 **Peer Review** | Enable student-to-student code reviews |

### For Students
| Feature | Description |
|---|---|
| 📝 **Multi-format Assignments** | Submit code, text answers, or take quizzes |
| 📦 **Submission Versioning** | Git-style history of all submission attempts |
| ✅ **Self-check Lists** | Verify work before submitting |
| 🗺️ **Skill Map** | Visual progress across CS topics |
| 🎮 **Gamification** | XP, levels, streaks, and achievements |
| 📁 **File Attachments** | Upload files alongside submissions |

### Platform-wide
| Feature | Description |
|---|---|
| 🤖 **AI Assistant** | Chat-bot powered by Google Gemini, scoped to IT topics |
| 🔐 **Authentication** | Registration with role selection (Teacher / Student) |
| 🌙 **Theming** | Light / Dark / System theme |
| 🌐 **i18n** | Full localization: Russian, Kazakh, English |
| 🧪 **Code Sandbox** | Run and test code snippets directly in the browser |
| 📚 **Lectures** | Create and view course materials with Markdown |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.6 |
| **Styling** | Tailwind CSS 3.4 |
| **Auth** | NextAuth.js 4 |
| **ORM** | Prisma 5.22 |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **AI** | Google Gemini API |
| **Icons** | Lucide React |

---

## 📐 Architecture

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── login/                          # Login
│   ├── register/                       # Registration
│   ├── dashboard/                      # Main dashboard with gamification
│   ├── classes/
│   │   ├── new/                        # Create class
│   │   └── [id]/
│   │       ├── page.tsx                # Class details (lectures, assignments, members)
│   │       ├── lectures/
│   │       │   ├── new/                # Create lecture
│   │       │   └── [lid]/              # Lecture detail + Q&A comments
│   │       └── assignments/
│   │           ├── new/                # Assignment builder + rubric + self-check
│   │           └── [aid]/              # Assignment detail + submit + grading
│   ├── join/                           # Join class by code
│   ├── grades/                         # Student grade history
│   ├── skills/                         # Skill progress map
│   ├── sandbox/                        # Code sandbox
│   └── api/                            # REST API routes
│       ├── auth/                       #   NextAuth endpoints
│       ├── classes/                    #   CRUD + join by code
│       ├── lectures/                   #   CRUD + comments
│       ├── assignments/                #   CRUD
│       ├── submissions/                #   Submit + upload
│       ├── grades/                     #   Grade submissions
│       ├── skills/                     #   Skill progress
│       ├── materials/                  #   File upload/download
│       ├── peer-reviews/               #   Peer review system
│       └── execute/                    #   Code execution sandbox
├── components/
│   ├── ui/                             # Reusable UI components (Button, Card, Badge, Input)
│   ├── Sidebar.tsx                     # Navigation sidebar + mobile nav
│   ├── Navbar.tsx                      # Top navigation bar
│   ├── ThemeProvider.tsx               # Dark/light/system theme
│   ├── I18nProvider.tsx                # Localization context
│   └── LocaleSwitcher.tsx              # RU / KZ / EN language switcher
├── lib/
│   ├── i18n.ts                         # Translation dictionaries (ru, kz, en)
│   ├── prisma.ts                       # Prisma client singleton
│   └── auth.ts                         # NextAuth configuration
└── prisma/
    ├── schema.prisma                   # Database schema (15 models)
    └── seed.ts                         # Demo data seeder
```

---

## 🗃 Database Schema

The application uses **15 Prisma models**:

```mermaid
erDiagram
    User ||--o{ ClassEnrollment : enrolls
    User ||--o{ SubmissionVersion : submits
    User ||--o{ Achievement : earns
    Class ||--o{ ClassEnrollment : has
    Class ||--o{ Lecture : contains
    Class ||--o{ Assignment : contains
    Class ||--o{ Material : stores
    Lecture ||--o{ Comment : has
    Assignment ||--o{ RubricCriterion : defines
    Assignment ||--o{ SelfCheckItem : includes
    Assignment ||--o{ SubmissionVersion : receives
    Assignment ||--o{ AssignmentSkill : maps
    SubmissionVersion ||--o{ CriterionGrade : graded_by
    SubmissionVersion ||--o{ LineComment : reviewed_with
    SubmissionVersion ||--o{ PeerReview : peer_reviewed
```

**Models:** `User`, `Class`, `ClassEnrollment`, `Lecture`, `Assignment`, `RubricCriterion`, `SelfCheckItem`, `SubmissionVersion`, `CriterionGrade`, `LineComment`, `Material`, `Comment`, `PeerReview`, `Achievement`, `Skill`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/teachera.git
cd teachera

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see below)

# 4. Create database & generate Prisma client
npx prisma db push

# 5. Seed demo data
npm run db:seed

# 6. Start development server
npm run dev
```

Open **http://localhost:3000**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| 👨‍🏫 Teacher | `teacher@teachera.io` | `teacher123` |
| 🎓 Student | `student@teachera.io` | `student123` |

**Demo class code:** `DEMO01`

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# AI Assistant (optional — runs in mock mode without key)
GEMINI_API_KEY=""
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm run db:seed` | Seed database with demo data |

---

## 🌐 Localization

BaqyLab supports **3 languages** with full UI coverage:

| Language | Code | Status |
|---|---|---|
| 🇷🇺 Русский | `ru` | ✅ Complete |
| 🇰🇿 Қазақша | `kz` | ✅ Complete |
| 🇬🇧 English | `en` | ✅ Complete |

All translations are stored in `src/lib/i18n.ts` with **250+ keys** per locale. The language can be switched at runtime via the locale switcher in the navbar.

---

## 🐳 Docker

```bash
# Build
docker build -t teachera .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prod.db" \
  -e NEXTAUTH_SECRET="your-secret" \
  teachera
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

[MIT](LICENSE)

---

<p align="center">
  Made with ❤️ for CS education
</p>
