# Advanced Search Filters Implementation

## ✅ What Was Implemented

### 1. **Backend Implementation** ✅

#### Updated Schema (`backend/app/models/schemas.py`)
- Extended `SearchRequest` to include:
  - `year_from` / `year_to` - Publication year range
  - `journal` - Filter by journal name
  - `study_type` - Filter by study type (RCT, meta-analysis, etc.)
  - `author` - Filter by author name
  - `mesh_terms` - Filter by MeSH terms (array)
  - `search_fields` - Fields to search in (title, abstract, author, all)
  - `boolean_operator` - Boolean operator (AND, OR, NOT)
  - `sort_by` - Sort by (relevance, date, citations)
  - `sort_order` - Sort order (asc, desc)

#### Updated PubMed Fetcher (`backend/data/pubmed_fetcher.py`)
- Enhanced `fetch_abstracts()` method to accept all filter parameters
- Builds PubMed query with:
  - Field-specific searches (`[Title]`, `[Abstract]`, `[Author]`)
  - Year range filters (`[Publication Date]`)
  - Journal filters (`[Journal]`)
  - Author filters (`[Author]`)
  - Study type filters (`[Publication Type]`)
  - MeSH term filters (`[MeSH Terms]`)
  - Boolean operators (AND, OR, NOT)
- Sorting support:
  - Relevance (default)
  - Publication date
  - Citations (uses relevance score as proxy)

#### Updated Search Endpoint (`backend/app/api/routes/search.py`)
- Passes all filter parameters to PubMed fetcher
- Returns filtered and sorted results

### 2. **Frontend Implementation** ✅

#### Advanced Filters Component (`frontend/components/AdvancedFilters.tsx`)
- **Collapsible filter panel** with:
  - Year range selector (from/to)
  - Journal input field
  - Study type dropdown (RCT, Meta-Analysis, Systematic Review, etc.)
  - Author input field
  - MeSH terms (add/remove multiple terms)
  - Search fields selector (Title, Abstract, Author, All Fields)
  - Boolean operator selector (AND, OR, NOT)
  - Sort options (Relevance, Date, Citations)
- **Visual indicators**:
  - Active filter badge
  - Reset button when filters are active
  - Color-coded active state

#### Updated SearchBar Component (`frontend/components/SearchBar.tsx`)
- Integrated AdvancedFilters component
- Auto-searches when filters change (if query exists)
- Visual indicator (border color) when filters are active
- Maintains filter state across searches

#### Updated API Client (`frontend/lib/api.ts`)
- Added `SearchFilters` interface
- Updated `searchPapers()` to accept filters parameter

## 🎯 Features Implemented

### ✅ Filter by Publication Year
- Date range selector (from/to)
- Validates year range (1900 to current year)
- PubMed date filter: `YYYY:YYYY[Publication Date]`

### ✅ Filter by Journal
- Text input for journal name
- PubMed filter: `"Journal Name"[Journal]`
- Supports partial matches

### ✅ Filter by Study Type
- Dropdown with common study types:
  - RCT / Randomized Controlled Trial
  - Meta-Analysis
  - Systematic Review
  - Review
  - Case Report
  - Clinical Trial
  - Cohort Study
  - Case-Control Study
- PubMed filter: `Study Type[Publication Type]`

### ✅ Filter by Author
- Text input for author name
- PubMed filter: `"Author Name"[Author]`
- Supports partial matches

### ✅ Filter by MeSH Terms
- Add multiple MeSH terms
- Remove individual terms
- PubMed filter: `"Term"[MeSH Terms]` for each term

### ✅ Sort Options
- **Relevance** (default) - Uses relevance scoring
- **Date** - Sorts by publication year (newest first)
- **Citations** - Uses relevance score as proxy

### ✅ Boolean Operators
- **AND** (default) - All conditions must match
- **OR** - Any condition can match
- **NOT** - Exclude matching conditions

### ✅ Field-Specific Search
- **Title** - Search only in paper titles
- **Abstract** - Search only in abstracts
- **Author** - Search only in author names
- **All Fields** (default) - Search in title and abstract

## 🚀 How to Use

### Basic Search
1. Enter your search query
2. Click "Search" or press Enter
3. Results appear sorted by relevance

### Using Filters
1. Click "Advanced Filters" to expand filter panel
2. Set your desired filters:
   - Year range (from/to)
   - Journal name
   - Study type
   - Author name
   - MeSH terms (add multiple)
   - Search fields (Title, Abstract, Author, All)
   - Boolean operator (AND, OR, NOT)
   - Sort by (Relevance, Date, Citations)
3. Search automatically updates when filters change (if query exists)
4. Click "Reset" to clear all filters

### Example Filter Combinations

**Example 1: Recent RCTs on Diabetes**
- Query: "diabetes treatment"
- Year: From 2020 to 2024
- Study Type: RCT
- Sort: Date (newest first)

**Example 2: Meta-Analyses in Specific Journal**
- Query: "cancer immunotherapy"
- Journal: "Nature"
- Study Type: Meta-Analysis
- Sort: Relevance

**Example 3: Author-Specific Search**
- Query: "cardiovascular disease"
- Author: "Smith J"
- Year: From 2015
- Search Fields: Title

**Example 4: MeSH Terms Search**
- Query: "mental health"
- MeSH Terms: ["Depression", "Anxiety"]
- Boolean Operator: AND
- Sort: Relevance

## 📊 Technical Details

### PubMed Query Building

The system builds PubMed queries using the following format:

```
(Base Query[Field]) AND (Filter1[FilterType]) AND (Filter2[FilterType]) ...
```

**Examples:**

1. **Year Range:**
   ```
   (diabetes[Title/Abstract]) AND (2020:2024[Publication Date])
   ```

2. **Journal + Study Type:**
   ```
   (cancer[Title/Abstract]) AND ("Nature"[Journal]) AND (Meta-Analysis[Publication Type])
   ```

3. **Author + MeSH:**
   ```
   (treatment[Title/Abstract]) AND ("Smith J"[Author]) AND ("Diabetes Mellitus"[MeSH Terms])
   ```

4. **Field-Specific:**
   ```
   (diabetes[Title]) OR (diabetes[Abstract])
   ```

### Boolean Operators

- **AND**: All conditions must match (default)
- **OR**: Any condition can match
- **NOT**: Exclude matching conditions

### Sorting

- **Relevance**: Uses relevance scoring algorithm (title matches weighted higher)
- **Date**: Sorts by publication year (newest first)
- **Citations**: Uses relevance score as proxy (PubMed doesn't provide citation counts directly)

## 🎨 UI/UX Features

1. **Collapsible Panel** - Filters hidden by default, expandable on click
2. **Active Filter Indicator** - Badge shows when filters are active
3. **Visual Feedback** - Border color changes when filters are active
4. **Auto-Search** - Automatically searches when filters change (if query exists)
5. **Reset Button** - Quick way to clear all filters
6. **Responsive Design** - Works on mobile and desktop

## ✅ Testing Checklist

- [x] Year range filter works correctly
- [x] Journal filter works correctly
- [x] Study type filter works correctly
- [x] Author filter works correctly
- [x] MeSH terms can be added/removed
- [x] Search fields selection works
- [x] Boolean operators work correctly
- [x] Sorting works (relevance, date, citations)
- [x] Multiple filters can be combined
- [x] Reset clears all filters
- [x] Auto-search triggers on filter change
- [x] Visual indicators show active filters
- [x] UI is responsive and accessible

## 🔧 Future Enhancements

Potential improvements:
1. **Citation Count** - Integrate with external APIs for real citation counts
2. **Saved Filter Presets** - Save commonly used filter combinations
3. **Filter Suggestions** - Auto-suggest journals/authors based on query
4. **Advanced MeSH Browser** - Visual MeSH term browser
5. **Filter History** - Remember recently used filters
6. **Export Filters** - Share filter configurations

## 📝 Notes

- PubMed API has rate limits - be mindful of excessive requests
- Some filters may return fewer results - this is expected
- MeSH terms are case-sensitive in PubMed
- Journal names should match PubMed's exact format for best results
- Year filters use publication date, not submission date

## 🎉 Summary

You now have a **complete advanced search filter system** that allows users to:
- ✅ Filter by publication year (date range)
- ✅ Filter by journal
- ✅ Filter by study type
- ✅ Filter by author
- ✅ Filter by MeSH terms
- ✅ Sort by relevance, date, or citations
- ✅ Use boolean operators (AND, OR, NOT)
- ✅ Search in specific fields (title, abstract, author)

All filters work together seamlessly and provide a professional-grade search experience!





