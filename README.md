# QA Studio - Kiro

AI-powered testing workflow automation platform for QA engineers. Generate test cases, scripts, perform accessibility audits, API testing, and manage STLC artifacts with multi-user support and cloud persistence.

## ✨ Features

### AI-Powered Testing
- **AI Test Case Generator** - Generate comprehensive test cases from user stories
- **AI Test Script Generator** - Create automation scripts for Playwright, Cypress, Selenium, Robot Framework
- **ADA Auditor** - AI-powered accessibility auditing with WCAG compliance analysis
- **API Testing** - REST & GraphQL testing with AI-generated assertions

### Test Management
- **Test Plan Maker** - Create test plans with traceability matrix
- **STLC / Backlog** - Manage user stories and bugs with Kanban/list views
- **Multi-User Support** - Secure user authentication and data isolation
- **Cloud Persistence** - Automatic data sync across devices

### Security & Collaboration
- 🔒 **Secure Authentication** - Email/password authentication via Supabase
- 👥 **Multi-User Isolation** - Each user's data is completely isolated
- ☁️ **Cloud Storage** - All data persisted in PostgreSQL via Supabase
- 💾 **Auto-Save** - Changes automatically saved every second
- 🔄 **Real-Time Sync** - Access your data from any device

## Tech Stack

- **Frontend**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS with dark theme
- **Routing**: Hash-based routing
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Backend**: Express.js
- **AI**: Google Gemini API
- **Code Highlighting**: highlight.js
- **Export**: xlsx, jspdf

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works!)
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Khushal05220/QA-Studio-Kiro.git
cd QA-Studio-Kiro/qa-studio
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Create a project at https://supabase.com
   - Go to SQL Editor and run the contents of `supabase-setup.sql`
   - Get your project URL and anon key from Settings > API

4. **Configure environment**
```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your credentials:
# - GEMINI_API_KEY
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

5. **Start development**
```bash
npm run dev
```

6. **Open the app**
   - Navigate to `http://localhost:3000`
   - Create your account
   - Start testing!

📖 **Detailed Setup**: See [qa-studio/QUICK_START.md](qa-studio/QUICK_START.md) for step-by-step instructions

## 📁 Project Structure

```
QA-Studio-Kiro/
├── .kiro/                 # Kiro AI integration (REQUIRED)
│   ├── specs/             # Feature specifications
│   ├── hooks/             # Automation hooks
│   ├── steering/          # AI behavior guidelines
│   └── vibe/              # UI/UX guidelines
├── qa-studio/             # Main application
│   ├── src/               # Source code
│   ├── server/            # Backend server
│   └── ...
├── LICENSE                # MIT License
└── README.md              # This file
```

## 🔌 API Endpoints

### AI Endpoints (Backend)
- `POST /api/ai/generate-testcases` - Generate test cases from user story
- `POST /api/ai/generate-script` - Generate test script (streaming)
- `POST /api/ai/audit-accessibility` - Run accessibility audit
- `POST /api/ai/generate-assertions` - Generate API test assertions

### Database Operations (Supabase)
All data operations are handled through Supabase with Row Level Security:
- Test Cases - Automatic user isolation
- User Stories - Per-user data
- Bugs - Secure storage
- Test Plans - User-specific plans
- API Collections - Private collections

## 📤 Export Formats

- JSON
- CSV
- Excel (.xlsx)
- PDF
- Markdown
- Postman Collection

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Row Level Security (RLS) in database
- ✅ Secure password hashing
- ✅ User data isolation
- ✅ Protected API routes
- ✅ XSS and SQL injection protection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Supabase for authentication and database
- React and Tailwind CSS communities
- Kiro AI for development assistance

---

**Built with ❤️ for QA Engineers using Kiro AI**
