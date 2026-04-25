"""
PubMed API Fetcher - Fetches papers from PubMed
"""

import requests
from typing import List, Dict
from app.core.config import settings


class PubMedFetcher:
    """Fetches papers from PubMed API"""
    
    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    
    # Simple in-memory cache for paper titles (to avoid redundant fetches)
    _paper_title_cache = {}
    
    def __init__(self):
        # Use email from settings or default
        self.email = settings.pubmed_email or "user@example.com"
    
    def fetch_abstracts(
        self, 
        query: str, 
        max_results: int = 10,
        year_from: int = None,
        year_to: int = None,
        journal: str = None,
        study_type: str = None,
        author: str = None,
        mesh_terms: List[str] = None,
        search_fields: List[str] = None,
        boolean_operator: str = "AND",
        sort_by: str = "relevance",
        language: str = "en"
    ) -> List[Dict]:
        """
        Fetch abstracts from PubMed with advanced filtering and query processing
        
        Args:
            query: Base search query
            max_results: Maximum number of results
            year_from: Filter papers from this year onwards
            year_to: Filter papers up to this year
            journal: Filter by journal name
            study_type: Filter by study type (RCT, meta-analysis, etc.)
            author: Filter by author name
            mesh_terms: List of MeSH terms to filter by
            search_fields: Fields to search in (title, abstract, author, all)
            boolean_operator: Boolean operator (AND, OR, NOT)
            sort_by: Sort by (relevance, date, citations)
        """
        try:
            import re
            from datetime import datetime
            
            original_query = query.lower()
            
            # Clean up natural language queries - remove question words and common stop words
            import re
            question_words = ['what', 'are', 'the', 'latest', 'treatments', 'for', 'how', 'do', 'does', 'can', 'will', 'is', 'was', 'were', 'which', 'who', 'when', 'where', 'why']
            
            # Check if query looks like a natural language question
            query_lower = query.lower().strip()
            is_question = query_lower.startswith(('what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'will', 'do', 'does', 'is', 'are', 'was', 'were'))
            
            # Extract key terms from natural language queries
            if is_question or len(query.split()) > 5:
                # Extract meaningful words (remove question words and common stop words)
                words = re.findall(r'\b\w+\b', query_lower)
                stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'latest', 'new', 'recent'}
                key_terms = [w for w in words if w not in stop_words and len(w) > 2]
                
                if key_terms:
                    # Use key terms for search instead of full query
                    cleaned_query = " ".join(key_terms)
                else:
                    # Fallback to original query if no key terms found
                    cleaned_query = query
            else:
                # For short queries, use as-is
                cleaned_query = query
            
            processed_query = cleaned_query
            
            # Build field-specific search if specified
            if search_fields and len(search_fields) > 0 and "all" not in [f.lower() for f in search_fields]:
                field_queries = []
                for field in search_fields:
                    field_lower = field.lower()
                    if field_lower == "title":
                        field_queries.append(f"({cleaned_query}[Title])")
                    elif field_lower == "abstract":
                        field_queries.append(f"({cleaned_query}[Abstract])")
                    elif field_lower == "author":
                        field_queries.append(f"({cleaned_query}[Author])")
                
                if field_queries:
                    if boolean_operator.upper() == "OR":
                        processed_query = " OR ".join(field_queries)
                    elif boolean_operator.upper() == "NOT":
                        processed_query = f"({cleaned_query}) NOT ({' OR '.join(field_queries)})"
                    else:  # AND
                        processed_query = " AND ".join(field_queries)
            else:
                # Default: search in Title/Abstract (but don't wrap if it's already a PubMed query format)
                if '[' in cleaned_query and ']' in cleaned_query:
                    # Already has field specifiers, use as-is
                    processed_query = cleaned_query
                else:
                    # For natural language queries, use a more flexible search
                    # Split into individual terms and search each in Title/Abstract
                    if is_question or len(cleaned_query.split()) > 2:
                        # Use AND operator to find papers with all key terms
                        terms = cleaned_query.split()
                        if len(terms) > 1:
                            # Search each term in Title/Abstract and combine with AND
                            term_queries = [f"{term}[Title/Abstract]" for term in terms]
                            processed_query = " AND ".join(term_queries)
                        else:
                            processed_query = f"{cleaned_query}[Title/Abstract]"
                    else:
                        # Wrap in Title/Abstract search
                        processed_query = f"({cleaned_query}[Title/Abstract])"
            
            # Add filters
            filters = []
            
            # Year range filter
            if year_from or year_to:
                if year_from and year_to:
                    filters.append(f"{year_from}:{year_to}[Publication Date]")
                elif year_from:
                    filters.append(f"{year_from}:{datetime.now().year}[Publication Date]")
                elif year_to:
                    filters.append(f"1900:{year_to}[Publication Date]")
            
            # Journal filter
            if journal:
                filters.append(f'"{journal}"[Journal]')
            
            # Author filter
            if author:
                filters.append(f'"{author}"[Author]')
            
            # Study type filter (using publication types)
            study_type_mapping = {
                "rct": "Randomized Controlled Trial[Publication Type]",
                "randomized controlled trial": "Randomized Controlled Trial[Publication Type]",
                "meta-analysis": "Meta-Analysis[Publication Type]",
                "systematic review": "Systematic Review[Publication Type]",
                "review": "Review[Publication Type]",
                "case report": "Case Reports[Publication Type]",
                "clinical trial": "Clinical Trial[Publication Type]",
                "cohort study": "Cohort Studies[Publication Type]",
                "case-control": "Case-Control Studies[Publication Type]"
            }
            if study_type:
                study_type_lower = study_type.lower()
                if study_type_lower in study_type_mapping:
                    filters.append(study_type_mapping[study_type_lower])
                else:
                    # Try to match partial
                    for key, value in study_type_mapping.items():
                        if key in study_type_lower:
                            filters.append(value)
                            break
            
            # MeSH terms filter
            if mesh_terms:
                mesh_filters = [f'"{term}"[MeSH Terms]' for term in mesh_terms]
                filters.extend(mesh_filters)
            
            # Combine filters with boolean operator
            if filters:
                if boolean_operator.upper() == "OR":
                    filter_query = " OR ".join(filters)
                    processed_query = f"({processed_query}) AND ({filter_query})"
                elif boolean_operator.upper() == "NOT":
                    filter_query = " AND ".join(filters)
                    processed_query = f"({processed_query}) NOT ({filter_query})"
                else:  # AND (default)
                    filter_query = " AND ".join(filters)
                    processed_query = f"({processed_query}) AND ({filter_query})"
            
            # Extract year from query if present (legacy support)
            year_pattern = r'\b(19|20)\d{2}\b'
            year_matches = re.findall(year_pattern, query)
            
            # Extract age-related terms for better matching
            age_patterns = {
                'elderly': r'\b(elderly|older|senior|aged|geriatric|50\+|50 and above|over 50|above 50)\b',
                'middle_aged': r'\b(middle.?aged|40.?60|40s|50s)\b',
                'adult': r'\b(adult|adults)\b',
                'age_specific': r'\b(aged|age|years old|years of age)\b'
            }
            
            # Detect age-related criteria in query
            age_keywords = []
            for age_type, pattern in age_patterns.items():
                if re.search(pattern, original_query, re.IGNORECASE):
                    age_keywords.extend(re.findall(pattern, original_query, re.IGNORECASE))
            
            # Improve query for PubMed - add age-related MeSH terms if detected
            if age_keywords:
                # Add age-related terms to PubMed query for better matching
                age_terms = []
                if any('50' in kw or 'elderly' in kw.lower() or 'older' in kw.lower() or 'senior' in kw.lower() for kw in age_keywords):
                    age_terms.append('(elderly[Title/Abstract] OR aged[Title/Abstract] OR "middle aged"[Title/Abstract])')
                if age_terms:
                    processed_query = f"{processed_query} AND ({' OR '.join(age_terms)})"
            
            # If year found in query but no year filter specified, add PubMed date filter (legacy support)
            if year_matches and not year_from and not year_to:
                # Extract the last 4-digit year found (most likely the filter year)
                year_str = None
                for match in reversed(year_matches):
                    # Find full 4-digit year
                    full_year_match = re.search(r'\b(19|20)\d{2}\b', query)
                    if full_year_match:
                        year_str = full_year_match.group(0)
                        break
                
                if year_str:
                    year_int = int(year_str)
                    current_year = datetime.now().year
                    # Only filter if year is reasonable
                    if 1900 <= year_int <= current_year + 1:
                        # Remove year from query text and add PubMed date filter
                        processed_query = re.sub(r'\b' + year_str + r'\b', '', processed_query).strip()
                        # Add PubMed date filter: [Publication Date] format
                        # PubMed uses format: YYYY/MM/DD or YYYY
                        processed_query = f"{processed_query} AND ({year_str}[Publication Date])"
            
            # Add language filter if specified and not English
            if language and language != "en":
                # PubMed language filter format: [Language]
                # Map language codes to PubMed language names
                language_map = {
                    'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
                    'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese', 'ja': 'Japanese',
                    'ko': 'Korean', 'ar': 'Arabic', 'nl': 'Dutch', 'pl': 'Polish',
                    'tr': 'Turkish', 'vi': 'Vietnamese', 'th': 'Thai', 'id': 'Indonesian',
                    'cs': 'Czech', 'sv': 'Swedish', 'da': 'Danish', 'fi': 'Finnish',
                    'no': 'Norwegian', 'he': 'Hebrew', 'uk': 'Ukrainian', 'ro': 'Romanian',
                    'hu': 'Hungarian', 'el': 'Greek', 'bg': 'Bulgarian', 'hr': 'Croatian',
                    'sk': 'Slovak', 'sl': 'Slovenian', 'et': 'Estonian', 'lv': 'Latvian',
                    'lt': 'Lithuanian',
                }
                pubmed_lang = language_map.get(language, 'English')
                processed_query = f"{processed_query} AND ({pubmed_lang}[Language])"
            
            # 1. Search for IDs
            search_url = f"{self.BASE_URL}/esearch.fcgi"
            # Ask PubMed for more PMIDs than we return, so we can re-rank and drop weak matches.
            # (Previously we requested a larger retmax but trimmed IDs to max_results before efetch, which
            # defeated that strategy.) Cap keeps latency and URL sizes reasonable.
            _scoring_pool = min(max(max_results * 4, 20), 100)
            search_params = {
                "db": "pubmed",
                "term": processed_query,
                "retmax": _scoring_pool,
                "usehistory": "y",
                "email": self.email,
                "retmode": "json"
            }
            
            # Add sort parameter if specified
            if sort_by == "date":
                search_params["sort"] = "pub_date"
            elif sort_by == "relevance":
                search_params["sort"] = "relevance"
            
            print(f"Searching PubMed for '{query}'...")
            response = requests.get(search_url, params=search_params, timeout=5)  # Reduced timeout
            response.raise_for_status()
            data = response.json()
            
            id_list = data.get("esearchresult", {}).get("idlist", [])
            print(f"Found {len(id_list)} papers.")
            
            if not id_list:
                return []
            
            # Use the full pool we asked for; trimming to max_results happens *after* scoring
            id_list = id_list[:_scoring_pool]
            
            # 2. Fetch details for IDs in batches (to avoid URL length limit)
            # PubMed API has a limit, so we'll batch requests
            batch_size = 200  # Safe batch size to avoid 414 errors
            papers = []
            import xml.etree.ElementTree as ET
            
            for i in range(0, len(id_list), batch_size):
                batch_ids = id_list[i:i + batch_size]
                print(f"Fetching paper details batch {i//batch_size + 1} ({len(batch_ids)} papers)...")
                
                fetch_url = f"{self.BASE_URL}/efetch.fcgi"
                fetch_params = {
                    "db": "pubmed",
                    "id": ",".join(batch_ids),
                    "retmode": "xml",
                    "email": self.email
                }
                
                try:
                    fetch_response = requests.get(fetch_url, params=fetch_params, timeout=5)  # Reduced timeout
                    fetch_response.raise_for_status()
                    
                    # Parse XML
                    try:
                        root = ET.fromstring(fetch_response.content)
                    except ET.ParseError as e:
                        print(f"XML parsing error: {e}")
                        print(f"Response content (first 500 chars): {fetch_response.content[:500]}")
                        continue
                    
                    # Check if we have any articles
                    articles = root.findall(".//PubmedArticle")
                    if not articles:
                        # Try alternative structure
                        articles = root.findall(".//PubmedData")
                        if not articles:
                            print(f"No articles found in XML response for batch {i//batch_size + 1}")
                            print(f"Response content (first 500 chars): {fetch_response.content[:500]}")
                    
                    for article in articles:
                        try:
                            # Title
                            title_elem = article.find(".//ArticleTitle")
                            if title_elem is None or title_elem.text is None:
                                # Try alternative path
                                title_elem = article.find(".//Title")
                                if title_elem is None or title_elem.text is None:
                                    continue
                            title = title_elem.text.strip()
                            
                            # Abstract
                            abstract_list = article.findall(".//AbstractText")
                            abstract = " ".join([elem.text for elem in abstract_list if elem.text])
                            
                            # PMID
                            pmid_elem = article.find(".//PMID")
                            if pmid_elem is None or pmid_elem.text is None:
                                continue
                            pmid = pmid_elem.text
                            
                            # Year - Extract year more carefully
                            year_text = "N/A"
                            year_elem = article.find(".//PubDate/Year")
                            if year_elem is not None and year_elem.text:
                                # Use Year element if available (most reliable)
                                year_text = year_elem.text.strip()
                            else:
                                # Try MedlineDate as fallback (can be "2024", "2024-2025", "2024 Jan", etc.)
                                medline_date = article.find(".//PubDate/MedlineDate")
                                if medline_date is not None and medline_date.text:
                                    medline_text = medline_date.text.strip()
                                    # Extract first 4-digit year from MedlineDate
                                    import re
                                    year_match = re.search(r'\b(19|20)\d{2}\b', medline_text)
                                    if year_match:
                                        year_text = year_match.group(0)
                                    else:
                                        year_text = "N/A"
                            
                            # Validate year is reasonable (not in future, not too old)
                            if year_text != "N/A":
                                try:
                                    year_int = int(year_text)
                                    from datetime import datetime
                                    current_year = datetime.now().year
                                    # Only accept years between 1900 and current year + 1 (for early publications)
                                    if year_int < 1900 or year_int > current_year + 1:
                                        year_text = "N/A"
                                except ValueError:
                                    year_text = "N/A"
                            
                            # Authors
                            authors = []
                            for author in article.findall(".//Author"):
                                last_name = author.find("LastName")
                                initials = author.find("Initials")
                                if last_name is not None and last_name.text:
                                    name = last_name.text
                                    if initials is not None and initials.text:
                                        name += f" {initials.text}"
                                    authors.append(name)
                            
                            # Journal
                            journal = "N/A"
                            journal_elem = article.find(".//Journal/Title")
                            if journal_elem is not None and journal_elem.text:
                                journal = journal_elem.text
                            else:
                                # Try ISO abbreviation
                                iso_journal = article.find(".//Journal/ISOAbbreviation")
                                if iso_journal is not None and iso_journal.text:
                                    journal = iso_journal.text
                                    
                            if title and abstract:
                                papers.append({
                                    "title": title,
                                    "abstract": abstract,
                                    "pmid": pmid,
                                    "year": year_text,
                                    "authors": authors,
                                    "journal": journal,
                                    "text": f"{title}\n\n{abstract}" # For embedding
                                })
                        except Exception as e:
                            print(f"Error parsing article: {e}")
                            continue
                        
                except Exception as e:
                    print(f"Error fetching batch {i//batch_size + 1}: {e}")
                    continue
            
            print(f"Successfully fetched {len(papers)} papers.")
            
            # Score and re-rank papers based on relevance to original query
            if papers:
                papers = self._score_and_rank_papers(papers, original_query, age_keywords)
                
                # Apply sorting
                if sort_by == "date":
                    papers.sort(key=lambda x: int(x.get("year", 0)) if x.get("year") and str(x.get("year")).isdigit() else 0, reverse=True)
                elif sort_by == "citations":
                    # Note: PubMed doesn't provide citation counts directly, so we'll use relevance
                    papers.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
                # else: relevance (already sorted by _score_and_rank_papers)
                
                # Limit to max_results after sorting
                papers = papers[:max_results]
            
            return papers
            
        except Exception as e:
            print(f"Error fetching from PubMed: {e}")
            return []
    
    @staticmethod
    def _word_match_count(text: str, term: str) -> int:
        """Count whole-word matches; avoids substring noise (e.g. 'cell' in 'cellular')."""
        import re
        if not text or not term:
            return 0
        if len(term) <= 2:
            return 1 if re.search(rf"\b{re.escape(term)}\b", text, re.IGNORECASE) else 0
        return len(re.findall(rf"\b{re.escape(term)}\b", text, re.IGNORECASE))
    
    def _score_and_rank_papers(self, papers: List[Dict], query: str, age_keywords: List[str]) -> List[Dict]:
        """
        Score papers based on relevance to query and re-rank them
        
        Args:
            papers: List of paper dictionaries
            query: Original user query (lowercase)
            age_keywords: List of age-related keywords found in query
            
        Returns:
            Re-ranked list of papers with relevance scores
        """
        import re
        
        # Extract key terms from query (excluding common words)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'which', 'who', 'when', 'where', 'why', 'how'}
        query_terms = set(re.findall(r'\b\w+\b', query.lower())) - stop_words
        # Ultra-short tokens (e.g. 'ra', 'p') are noisy; require length >= 3 for scoring
        query_terms = {t for t in query_terms if len(t) >= 3}
        
        scored_papers = []
        
        for paper in papers:
            score = 0.0
            title = paper.get('title', '').lower()
            abstract = paper.get('abstract', '').lower()
            full_text = f"{title} {abstract}"
            
            if not query_terms:
                # Nothing to match on (e.g. all stop words); do not re-rank
                paper['relevance_score'] = 0.5
                scored_papers.append(paper)
                continue
            
            # Score based on title matches (higher weight)
            title_matches = sum(self._word_match_count(title, term) for term in query_terms)
            score += title_matches * 3.0  # Title matches are very important
            
            # Score based on abstract matches
            abstract_matches = sum(self._word_match_count(abstract, term) for term in query_terms)
            score += abstract_matches * 1.0
            
            # Bonus for age-related keywords if present in query
            if age_keywords:
                age_match_score = 0
                age_indicators = ['elderly', 'aged', 'older', 'senior', 'geriatric', '50', 'middle aged', 'years old']
                for indicator in age_indicators:
                    if indicator in full_text:
                        age_match_score += 2.0  # Strong bonus for age relevance
                        break  # Only count once per paper
                score += age_match_score
            
            # Bonus for exact phrase matches
            if len(query.split()) > 2:  # Only for multi-word queries
                query_phrases = [phrase.strip() for phrase in re.split(r'[,\s]+', query) if len(phrase.strip()) > 3]
                for phrase in query_phrases:
                    if phrase in full_text:
                        score += 2.0
            
            # Normalize score (0-1 range)
            max_possible_score = len(query_terms) * 4.0 + 4.0  # Max title + abstract + age bonus
            normalized_score = min(score / max_possible_score if max_possible_score > 0 else 0, 1.0)
            
            paper['relevance_score'] = normalized_score
            scored_papers.append(paper)
        
        # Sort by relevance score (highest first)
        scored_papers.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        # Drop stragglers: fixed floor + relative to best result (PubMed can return loosely related articles)
        if len(scored_papers) > 0:
            best = scored_papers[0].get('relevance_score', 0)
            if best <= 0:
                pass
            else:
                floor = max(0.14, 0.42 * best)
                if len(scored_papers) >= 3:
                    new_list = [p for p in scored_papers if p.get('relevance_score', 0) >= floor]
                    if new_list:
                        scored_papers = new_list
                elif len(scored_papers) == 2:
                    p1, p2 = scored_papers[0].get('relevance_score', 0), scored_papers[1].get('relevance_score', 0)
                    if p1 > 0 and p2 < max(0.12, 0.35 * p1):
                        scored_papers = scored_papers[:1]
        
        top = scored_papers[0].get('relevance_score', 0) if scored_papers else 0.0
        print(f"Re-ranked {len(scored_papers)} papers by relevance (top score: {top:.2f})")
        
        return scored_papers
    
    def fetch_related_papers(self, paper_id: str, max_results: int = 2, skip_paper_fetch: bool = False, paper_title: str = None) -> List[Dict]:
        """
        Fetch papers related to a given paper ID
        Uses PubMed's elink API to find related articles with keyword fallback
        
        Args:
            paper_id: PubMed ID
            max_results: Maximum number of results (default: 2)
            skip_paper_fetch: If True, skip fetching paper details (faster)
            paper_title: Optional paper title to avoid fetching (faster)
        """
        try:
            # Get paper title from cache or fetch if needed
            title = paper_title
            if not title:
                # Check cache first
                if paper_id in self._paper_title_cache:
                    title = self._paper_title_cache[paper_id]
                elif not skip_paper_fetch:
                    papers = self.fetch_abstracts(f"{paper_id}[PMID]", max_results=1)
                    if papers:
                        title = papers[0].get("title", "")
                        # Cache the title
                        self._paper_title_cache[paper_id] = title
            
            # Skip elink if we don't have title (it's likely to fail anyway)
            # Go straight to keyword search for faster results
            if title:
                # Extract key terms from title (first 3-4 words) for faster search
                title_words = title.split()[:4]
                search_query = " ".join(title_words)
                # Search for similar papers directly (faster than elink)
                similar_papers = self.fetch_abstracts(search_query, max_results=max_results + 1)
                # Filter out the original paper
                similar_papers = [p for p in similar_papers if p.get("pmid") != paper_id]
                if similar_papers:
                    print(f"Found {len(similar_papers)} similar papers via keyword search")
                    return similar_papers[:max_results]
            
            # Fallback: Try elink API (but with shorter timeout)
            elink_url = f"{self.BASE_URL}/elink.fcgi"
            elink_params = {
                "dbfrom": "pubmed",
                "db": "pubmed",
                "id": paper_id,
                "cmd": "neighbor",
                "retmode": "json"
            }
            
            try:
                response = requests.get(elink_url, params=elink_params, timeout=5)  # Reduced timeout
                response.raise_for_status()
                elink_data = response.json()
            except Exception as e:
                print(f"Elink API failed for PMID {paper_id}, skipping: {e}")
                return []
            
            # Extract related paper IDs from elink response
            # PubMed elink API structure can vary, try multiple paths
            related_ids = []
            try:
                # Method 1: Standard structure - linksets -> linksetdbs -> links -> id
                if "linksets" in elink_data:
                    for linkset in elink_data["linksets"]:
                        if "linksetdbs" in linkset:
                            for linksetdb in linkset["linksetdbs"]:
                                if "links" in linksetdb:
                                    for link in linksetdb["links"]:
                                        if "id" in link:
                                            if isinstance(link["id"], list):
                                                related_ids.extend([str(id_val) for id_val in link["id"]])
                                            else:
                                                related_ids.append(str(link["id"]))
                                # Alternative: direct idlist in linksetdb
                                if "idlist" in linksetdb:
                                    if isinstance(linksetdb["idlist"], list):
                                        related_ids.extend([str(id_val) for id_val in linksetdb["idlist"]])
                                    else:
                                        related_ids.append(str(linksetdb["idlist"]))
                        # Alternative: direct idlist in linkset
                        if "idlist" in linkset:
                            if isinstance(linkset["idlist"], list):
                                related_ids.extend([str(id_val) for id_val in linkset["idlist"]])
                            else:
                                related_ids.append(str(linkset["idlist"]))
                
                # Remove duplicates and the original paper_id
                related_ids = list(set([str(id_val) for id_val in related_ids if str(id_val) != str(paper_id)]))
                
            except Exception as e:
                print(f"Error parsing elink response: {e}")
                import json
                print(f"Response structure: {json.dumps(elink_data, indent=2)[:1000]}")
            
            if not related_ids:
                return []
            
            # Limit to max_results
            related_ids = related_ids[:max_results]
            
            # Fetch details for related papers
            if not related_ids:
                return []
            
            # Fetch papers using efetch
            efetch_url = f"{self.BASE_URL}/efetch.fcgi"
            efetch_params = {
                "db": "pubmed",
                "id": ",".join(related_ids),
                "retmode": "xml",
                "rettype": "abstract",
                "email": self.email
            }
            
            response = requests.get(efetch_url, params=efetch_params, timeout=5)  # Reduced timeout
            response.raise_for_status()
            
            # Parse XML response
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            papers_list = []
            for article in root.findall(".//PubmedArticle"):
                try:
                    # Title
                    title = article.find(".//ArticleTitle")
                    if title is None or title.text is None:
                        continue
                    title_text = title.text.strip()
                    
                    # Abstract - handle both single and multiple AbstractText elements
                    abstract_text = ""
                    abstract_elems = article.findall(".//AbstractText")
                    if abstract_elems:
                        abstract_parts = []
                        for elem in abstract_elems:
                            if elem.text:
                                abstract_parts.append(elem.text.strip())
                            # Also check for nested text
                            for child in elem:
                                if child.text:
                                    abstract_parts.append(child.text.strip())
                        abstract_text = " ".join(abstract_parts)
                    
                    # Authors
                    authors = []
                    author_list = article.findall(".//Author")
                    for author in author_list:
                        last_name = author.find("LastName")
                        first_name = author.find("ForeName")
                        if last_name is not None and last_name.text:
                            author_name = last_name.text
                            if first_name is not None and first_name.text:
                                author_name += f" {first_name.text}"
                            authors.append(author_name)
                    
                    # Journal
                    journal_elem = article.find(".//Journal/Title")
                    journal = journal_elem.text if journal_elem is not None and journal_elem.text else "N/A"
                    
                    # Year - Extract year more carefully
                    year = "N/A"
                    year_elem = article.find(".//PubDate/Year")
                    if year_elem is not None and year_elem.text:
                        year = year_elem.text.strip()
                    else:
                        # Try MedlineDate as fallback
                        medline_date = article.find(".//PubDate/MedlineDate")
                        if medline_date is not None and medline_date.text:
                            import re
                            medline_text = medline_date.text.strip()
                            year_match = re.search(r'\b(19|20)\d{2}\b', medline_text)
                            if year_match:
                                year = year_match.group(0)
                    
                    # PMID
                    pmid_elem = article.find(".//PMID")
                    pmid = pmid_elem.text if pmid_elem is not None and pmid_elem.text else ""
                    
                    papers_list.append({
                        "pmid": pmid,
                        "title": title_text,
                        "abstract": abstract_text,
                        "authors": authors,
                        "year": year,
                        "journal": journal
                    })
                except Exception as e:
                    print(f"Error parsing article: {e}")
                    continue
            
            return papers_list[:max_results]
            
        except Exception as e:
            print(f"Error fetching related papers: {e}")
            # Fallback: return empty list
            return []

