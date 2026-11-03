# MedEvidence Frontend

Next.js frontend for ResearchGPT - Medical Research LLM Platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if your backend is on a different URL

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page (Chat/Search tabs)
│   └── globals.css       # Global styles
├── components/
│   ├── Chat.tsx          # Chat interface
│   ├── Message.tsx       # Message component
│   ├── Citation.tsx       # Citation display
│   └── SearchBar.tsx     # Paper search
├── lib/
│   ├── api.ts            # API client
│   └── utils.ts          # Utility functions
└── package.json
```

## 🎨 Features

- **Chat Interface**: Ask research questions and get AI-generated answers with citations
- **Paper Search**: Search for medical papers in the database
- **Citation Display**: View and access citations from PubMed
- **Responsive Design**: Works on desktop and mobile

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:8000` by default.

**Endpoints Used:**

- `POST /api/query` - Submit research questions
- `POST /api/search` - Search for papers
- `GET /api/papers/{pmid}` - Get paper details
- `GET /health` - Health check

## 🛠️ Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📦 Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🔧 Configuration

Set the backend API URL in `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

**CORS Errors:**

- Make sure backend CORS is configured to allow `http://localhost:3000`
- Check that backend is running on the correct port

**API Connection Issues:**

- Verify backend is running: `curl http://localhost:8000/health`
- Check `.env` file has correct `NEXT_PUBLIC_API_URL`
- Check browser console for errors
