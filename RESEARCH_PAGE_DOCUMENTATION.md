# 📄 Research Page Documentation

## Overview

The Research Page (`/research`) is the main interactive interface where users can ask clinical questions and search medical papers. It provides a dedicated, focused environment for medical research activities.

## File Location

- **Path**: `frontend/app/research/page.tsx`
- **Route**: `/research`
- **Type**: Client Component (uses React hooks)

---

## Features

### 1. **Dual-Mode Interface**
The page provides two main modes accessible via tabs:

#### **Ask Clinical Questions** (Default)
- AI-powered Q&A interface
- Generates evidence-based answers from PubMed papers
- Includes citations with each answer
- Supports PDF download of answers

#### **Search Medical Papers**
- Direct search through PubMed database
- Returns list of relevant medical papers
- Shows abstracts, authors, journals, and PMIDs
- Links to full papers on PubMed

### 2. **Navigation**
- **Header**: Branded navigation with logo and "Back to Home" link
- **Theme Toggle**: Dark/Light mode switcher
- **Sticky Navigation**: Stays visible while scrolling

### 3. **Welcome Section**
- Badge: "AI-Powered Medical Research"
- Heading: "Start Your Research"
- Description: Explains the two main features

---

## Component Structure

```tsx
ResearchPage
├── Navigation Header
│   ├── Logo & Brand Name
│   ├── Theme Toggle
│   └── Back to Home Link
├── Welcome Section
│   ├── Badge
│   ├── Heading
│   └── Description
├── Research Interface Card
│   ├── Tabs (Ask Clinical Questions / Search Medical Papers)
│   └── Content Area
│       ├── Chat Component (when chat tab active)
│       └── SearchBar Component (when search tab active)
└── Helper Text Footer
```

---

## Key Components Used

### 1. **Chat Component** (`@/components/Chat`)
- **Purpose**: Handles clinical question answering
- **Features**:
  - Message history display
  - Input field for questions
  - Loading states
  - PDF download functionality
  - Example questions
  - Citation display

### 2. **SearchBar Component** (`@/components/SearchBar`)
- **Purpose**: Handles medical paper search
- **Features**:
  - Search input
  - Results display
  - Paper cards with abstracts
  - PubMed links
  - PDF export of search results

### 3. **ThemeToggle Component** (`@/components/ThemeToggle`)
- **Purpose**: Switches between light and dark themes
- **Location**: Navigation header

---

## State Management

### Active Tab State
```tsx
const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat')
```

- **Default**: `'chat'` (Ask Clinical Questions)
- **Switches**: Between `'chat'` and `'search'` modes
- **Updates**: When user clicks tab buttons

### Theme State
```tsx
const { theme } = useTheme()
```

- **Source**: Theme context provider
- **Purpose**: Applies dark/light mode styling

---

## User Flow

### Flow 1: Ask Clinical Question
```
1. User lands on /research page
2. "Ask Clinical Questions" tab is active by default
3. User types a clinical question
4. Clicks "Send" button
5. System searches PubMed for relevant papers
6. AI generates answer based on papers
7. Answer displayed with citations
8. User can download PDF of answer
```

### Flow 2: Search Medical Papers
```
1. User clicks "Search Medical Papers" tab
2. User enters search query
3. Clicks "Search" button
4. System queries PubMed API
5. Results displayed as paper cards
6. User can click papers to view on PubMed
7. User can download PDF of search results
```

---

## Styling & Design

### Color Scheme
- **Primary**: Emerald (#10b981)
- **Secondary**: Teal (#14b8a6)
- **Accent**: Cyan (#06b6d4)
- **Background**: Gradient from slate to emerald/teal

### Layout
- **Max Width**: `max-w-7xl` (1280px)
- **Padding**: Responsive (px-4 sm:px-6 lg:px-8)
- **Card Style**: Rounded corners, shadow, border
- **Tabs**: Full-width, gradient backgrounds

### Responsive Design
- **Mobile**: Single column, stacked layout
- **Tablet**: Adjusted spacing and sizing
- **Desktop**: Full-width tabs, optimal spacing

---

## API Integration

### Chat Mode
- **Endpoint**: `POST /api/query`
- **Request**: `{ query: string }`
- **Response**: 
  ```typescript
  {
    answer: string,
    citations: Citation[],
    metadata: object
  }
  ```

### Search Mode
- **Endpoint**: `POST /api/search`
- **Request**: `{ query: string, limit?: number }`
- **Response**:
  ```typescript
  {
    papers: Paper[],
    total: number
  }
  ```

---

## Navigation Links

### Internal Links
- **Home**: `/` - Returns to homepage
- **Docs**: `/docs` - Documentation page

### External Links
- **PubMed**: Links to individual papers on PubMed
- **PDF Downloads**: Generated client-side

---

## Accessibility Features

1. **Keyboard Navigation**: Tab buttons are keyboard accessible
2. **ARIA Labels**: Social media links have aria-labels
3. **Focus States**: Visible focus indicators on interactive elements
4. **Semantic HTML**: Proper heading hierarchy and landmarks

---

## Performance Considerations

1. **Client-Side Rendering**: Uses 'use client' for interactivity
2. **Lazy Loading**: Components loaded on demand
3. **Optimized Images**: Icons use SVG (Lucide React)
4. **Efficient State**: Minimal re-renders with proper state management

---

## Future Enhancements

### Potential Additions
- [ ] Search history/saved queries
- [ ] Favorite papers/bookmarks
- [ ] Export to different formats (Word, Markdown)
- [ ] Advanced search filters
- [ ] Citation management
- [ ] Collaboration features
- [ ] User accounts and preferences

---

## Testing Checklist

- [x] Tab switching works correctly
- [x] Chat interface loads and functions
- [x] Search interface loads and functions
- [x] Theme toggle works
- [x] Navigation links work
- [x] Responsive design works on mobile/tablet/desktop
- [x] PDF download functionality works
- [x] Error handling for API failures

---

## Demo Video Section (Homepage)

The homepage (`frontend/app/page.tsx`) features a prominent demo video section that showcases the platform's capabilities before users navigate to the research page.

### Location
- **File**: `frontend/app/page.tsx`
- **Section**: Demo Video Section (after About section, before Stats section)
- **Route**: `/` (Homepage)

### Features

#### 1. **Video Player Container**
- **Aspect Ratio**: 16:9 (aspect-video)
- **Styling**: 
  - Dark gradient background (gray-900 to gray-800)
  - Rounded corners (rounded-3xl)
  - Shadow effects (shadow-2xl)
  - Border with hover effects (border-2 border-gray-700/50)
  - Hover border color change (emerald-500/30)

#### 2. **Placeholder Content**
Currently displays a placeholder with:
- **Play Button**: 
  - Large circular button (24x24, w-24 h-24)
  - Gradient background (emerald-600 → teal-600 → cyan-600)
  - Hover scale animation (hover:scale-110)
  - Shadow effects with emerald glow
  - Play icon from Lucide React
  
- **Text**:
  - "Demo Video Coming Soon" (prominent)
  - "Click 'Try It Yourself' below to experience the platform" (subtitle)

#### 3. **Animated Background Elements**
Three pulsing decorative blurs:
- **Top-left**: Emerald blur (w-32 h-32, emerald-500/20)
- **Bottom-right**: Teal blur (w-40 h-40, teal-500/20, 1s delay)
- **Center**: Cyan blur (w-64 h-64, cyan-500/10, 2s delay)
- All use `animate-pulse` with staggered delays for visual interest

#### 4. **Feature Highlights**
Two feature cards below the video:
- **Ask Clinical Questions Card**:
  - Icon: MessageSquare
  - Description of Q&A functionality
  - Emerald gradient icon background
  
- **Search Medical Papers Card**:
  - Icon: Search
  - Description of search functionality
  - Teal gradient icon background

#### 5. **Call-to-Action Button**
- **Text**: "Try It Yourself"
- **Link**: Routes to `/research` page
- **Styling**: 
  - Gradient button (emerald-600 → teal-600)
  - Hover effects (scale, shadow, translate)
  - Arrow icon (ArrowRight)

### Section Header
- **Badge**: "See It In Action" with Zap icon
- **Heading**: "Experience AI-Powered Medical Research"
- **Description**: Explains what users will see in the demo

### Implementation Details

```tsx
// Demo Video Section Structure
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
  {/* Header with badge, heading, description */}
  <div className="text-center mb-12">...</div>
  
  {/* Video Player Container */}
  <div className="max-w-6xl mx-auto">
    <div className="bg-gradient-to-br from-gray-900...">
      <div className="aspect-video...">
        {/* Placeholder content */}
        {/* Animated decorative elements */}
      </div>
    </div>
    
    {/* Feature Highlights */}
    <div className="grid md:grid-cols-2 gap-6">...</div>
    
    {/* CTA Button */}
    <div className="text-center mt-10">...</div>
  </div>
</section>
```

### Future Implementation

To add an actual video:

1. **Replace placeholder content** with video embed:
   ```tsx
   <iframe
     className="w-full h-full"
     src="YOUR_VIDEO_URL"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
     allowFullScreen
   />
   ```

2. **Or use Next.js Image/Video components** for optimized loading

3. **Video Sources**:
   - YouTube embed
   - Vimeo embed
   - Self-hosted video (MP4, WebM)
   - Cloud storage (S3, Cloudinary, etc.)

### Styling Classes Used
- `aspect-video` - Maintains 16:9 aspect ratio
- `bg-gradient-to-br` - Diagonal gradient backgrounds
- `animate-pulse` - Pulsing animation for decorative elements
- `group` / `group-hover` - Parent-child hover effects
- `transition-all duration-300` - Smooth transitions
- `shadow-2xl` - Large shadow effects
- `rounded-3xl` - Extra large border radius

### Responsive Design
- **Mobile**: Single column layout, full-width video
- **Tablet**: Adjusted spacing, feature cards stack
- **Desktop**: Two-column feature cards, optimal video size (max-w-6xl)

---

## Related Files

- `frontend/components/Chat.tsx` - Chat interface component
- `frontend/components/SearchBar.tsx` - Search interface component
- `frontend/lib/api.ts` - API client functions
- `frontend/lib/pdf-utils.ts` - PDF generation utilities
- `backend/app/api/routes/query.py` - Query endpoint
- `backend/app/api/routes/search.py` - Search endpoint
- `frontend/app/page.tsx` - Homepage with demo video section

---

## Usage Example

```tsx
// Navigate to research page
<Link href="/research">Start Researching</Link>

// Or programmatically
router.push('/research')
```

---

## Notes

- The research page is the core functionality of MedEvidence AI
- It's designed to be the primary user interface after landing on the homepage
- All features are accessible without authentication (public access)
- The page maintains state during tab switches (messages/search results persist)

---

**Last Updated**: Current
**Version**: 1.0
**Status**: ✅ Production Ready

