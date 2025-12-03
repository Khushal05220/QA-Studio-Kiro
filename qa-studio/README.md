# QA Studio

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

1. **Install dependencies**
```bash
npm install
```

2. **Setup Supabase**
   - Create a project at https://supabase.com
   - Go to SQL Editor and run the contents of `supabase-setup.sql`
   - Get your project URL and anon key from Settings > API

3. **Configure environment**
```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your credentials:
# - GEMINI_API_KEY
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

4. **Start development**
```bash
npm run dev
```

5. **Open the app**
   - Navigate to `http://localhost:3000`
   - Create your account
   - Start testing!

📖 **Detailed Setup**: See [QUICK_START.md](QUICK_START.md) for step-by-step instructions

### Environment Variables

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Server
PORT=3001

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
qa-studio/
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Sidebar with user profile
│   │   ├── modals/        # QuickCreate, ApiStatus modals
│   │   └── ui/            # Reusable UI components
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── AppContext.jsx       # App state with Supabase
│   ├── hooks/             # Custom hooks
│   ├── lib/
│   │   └── supabase.js    # Supabase client
│   ├── pages/
│   │   ├── Login.jsx      # Login/Signup page
│   │   └── ...            # Other pages
│   ├── router/            # Hash-based router
│   ├── services/
│   │   ├── api.js         # AI API service
│   │   ├── supabaseService.js  # Database operations
│   │   └── export.js      # Export utilities
│   └── styles/            # Tailwind CSS
├── server/
│   └── index.js           # Express backend with Gemini
├── supabase-setup.sql     # Database schema
├── QUICK_START.md         # Quick start guide
├── SUPABASE_SETUP.md      # Detailed setup instructions
├── TESTING_GUIDE.md       # Testing procedures
├── IMPLEMENTATION_SUMMARY.md  # Technical details
└── package.json
```

## Keyboard Shortcuts

- `Ctrl+K` - Quick create menu
- `Ctrl+Shift+T` - Go to Test Cases
- `Ctrl+Shift+S` - Go to Test Scripts
- `Ctrl+Shift+A` - Go to API Testing
- `Escape` - Close modals

## 🔌 API Endpoints

### AI Endpoints (Backend)
- `POST /api/ai/generate-testcases` - Generate test cases from user story
- `POST /api/ai/generate-script` - Generate test script (streaming)
- `POST /api/ai/audit-accessibility` - Run accessibility audit
- `POST /api/ai/summarize` - Summarize content
- `POST /api/ai/generate-assertions` - Generate API test assertions
- `POST /api/ai/elaborate` - Elaborate text with AI
- `POST /api/ai/generate-from-notes` - Generate user story/bug from notes

### Database Operations (Supabase)
All data operations are handled through Supabase with Row Level Security:
- Test Cases - Automatic user isolation
- User Stories - Per-user data
- Bugs - Secure storage
- Test Plans - User-specific plans
- API Collections - Private collections

### Utility Endpoints
- `GET /api/health` - Health check with Gemini status
- `POST /api/proxy/execute` - Proxy API requests for testing

## 🗄️ Database Schema

### Tables
- **test_cases** - Test cases with steps and expected results
- **user_stories** - User stories with acceptance criteria
- **bugs** - Bug tracking with severity and priority
- **test_plans** - Test plans with linked test cases
- **api_collections** - API request collections

All tables include:
- Row Level Security (RLS) for data isolation
- Automatic timestamps (created_at, updated_at)
- User ID foreign keys
- JSON fields for flexible data structures

## 📤 Export Formats

- JSON
- CSV
- Excel (.xlsx)
- PDF
- Markdown
- Postman Collection

## 🧪 Testing

Comprehensive testing guide available in [TESTING_GUIDE.md](TESTING_GUIDE.md)

### Quick Test
1. Create an account
2. Generate test cases from a user story
3. Create a test script
4. Refresh the page - your data should persist
5. Logout and login - your data should still be there

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Detailed Supabase setup
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing procedures
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Row Level Security (RLS) in database
- ✅ Secure password hashing
- ✅ User data isolation
- ✅ Protected API routes
- ✅ XSS and SQL injection protection

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway/Render)
```bash
# Deploy the server/ folder with Node.js
# Set environment variables in platform
```

### Database
- Already hosted on Supabase
- No additional deployment needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Supabase for authentication and database
- React and Tailwind CSS communities

---

**Built with ❤️ for QA Engineers**
