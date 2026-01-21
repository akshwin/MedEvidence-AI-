# MedEvidence AI: PubMed-Grounded Medical Question Answering with Citation-Centric Generation

**Author(s):** _Your Name_  
**Affiliation(s):** _Your Institution / Organization_  
**Corresponding author:** _email@example.com_

## Abstract

Clinicians and biomedical researchers face an accelerating volume of publications, making evidence retrieval and synthesis a frequent bottleneck. We present **MedEvidence AI**, a web-based medical research assistant that answers natural-language clinical questions by **retrieving** relevant biomedical literature from PubMed and generating responses that are **explicitly grounded** in the retrieved evidence. The system enforces an “evidence-only” policy by (i) retrieving PubMed abstracts per query, (ii) constructing a structured evidence context with human-readable citation metadata, and (iii) prompting a large language model (LLM) to produce a sectioned answer that integrates citations in-line rather than relying on parametric memory. We describe the architecture, retrieval and re-ranking strategy, citation extraction, and multilingual query support. We also outline an evaluation protocol for factuality, citation correctness, and utility in clinical literature review workflows.

**Keywords:** retrieval-augmented generation, medical question answering, PubMed, evidence grounding, citation generation

## 1. Introduction

Biomedical knowledge grows rapidly, with millions of new articles indexed over time, and clinicians must often make decisions under time constraints. Standard keyword-based search returns large result sets and requires manual triage and synthesis. Recent LLM systems can produce fluent answers, but may hallucinate or omit provenance. Evidence-grounded generation approaches (e.g., RAG \cite{lewis2020rag}) attempt to mitigate these risks by conditioning generation on retrieved documents.

This work contributes a practical system for **PubMed-grounded** question answering that prioritizes provenance and usability:

- **Evidence-first design**: the system retrieves PubMed abstracts per query and generates answers conditioned on those results.
- **Citation-centric prompting**: the evidence context is formatted with author/year metadata to steer the LLM toward correct in-text attribution.
- **Research UX**: an interactive web interface supports both “Ask a question” and “Search papers” workflows.
- **Multilingual access**: queries can be translated to improve PubMed retrieval while returning answers in the user’s preferred language.

## 2. Related Work

RAG-based systems combine retrieval with generation to improve factuality and provide provenance \cite{lewis2020rag}. In the biomedical domain, evidence-backed QA has been explored across datasets and clinical decision support contexts; however, deployed systems must balance latency, transparency, and controllability. MedEvidence AI emphasizes **citation correctness** and **retrieval transparency** in a lightweight web platform.

## 3. System Overview

MedEvidence AI is implemented as:

- **Frontend**: Next.js (TypeScript) web client offering a research page with two modes: clinical question answering and direct paper search.
- **Backend**: FastAPI (Python) API providing query processing, PubMed retrieval, citation extraction, and optional vector database services.
- **Retrieval source**: PubMed E-utilities (ESearch + EFetch) \cite{ncbi_eutils}.
- **LLM**: an API-hosted LLM accessed via Groq; the model is configured server-side and used only after evidence retrieval succeeds \cite{groq}.

### 3.1 Query and Search Modes

The platform offers two primary user flows:

1. **Ask clinical questions**: the user submits a natural-language question; the backend retrieves relevant PubMed abstracts and generates a structured answer with citations.
2. **Search medical papers**: the user submits a query and optional filters (year range, journal, study type, authors, MeSH terms); the backend returns a ranked list of papers with metadata and abstracts.

## 4. Methods

### 4.1 PubMed Retrieval

Given a query, the backend performs PubMed retrieval using E-utilities \cite{ncbi_eutils}:

- **ESearch** obtains candidate PubMed IDs (PMIDs) using a processed query string.
- **EFetch** retrieves paper metadata and abstracts for the candidate PMIDs.

#### Query Processing

To make PubMed retrieval robust to natural-language questions, the system:

- Removes common stop words and question words for long or interrogative queries.
- Constructs a PubMed fielded query, typically searching terms in **Title/Abstract**.
- Supports optional filters:
  - **Year range** (`[Publication Date]`)
  - **Journal** (`[Journal]`)
  - **Author** (`[Author]`)
  - **Study type** via mapped publication types (e.g., “Randomized Controlled Trial”)
  - **MeSH terms** (`[MeSH Terms]`)
  - **Language** (`[Language]`)

### 4.2 Re-ranking and Relevance Scoring

After fetching abstracts, papers are re-ranked using a lightweight lexical relevance heuristic:

- Title matches are up-weighted relative to abstract matches.
- Age-related query intent (e.g., “elderly”, “over 50”) adds bonus weight when detected in the paper text.
- A normalized relevance score in \([0,1]\) is assigned and papers can be filtered if the score is very low.

This approach aims to improve relevance under strict latency constraints without requiring offline indexing.

### 4.3 Evidence Context Construction

For answer generation, each retrieved paper is transformed into a structured evidence block containing:

- Short citation string (e.g., “FirstAuthor et al. (Year)”)
- Full citation string (authors, year, title, journal)
- PMID and abstract

This structure is designed to:

- Provide the LLM with human-readable citation handles (author/year) for attribution.
- Reduce ambiguity between sources during synthesis.

### 4.4 Citation Extraction

The system returns citations as a structured list containing PMID, title, authors, year, journal, and a relevance score. Citation records are derived directly from the retrieved PubMed paper metadata, providing provenance without requiring citation parsing from generated text.

### 4.5 LLM Answer Generation (Citation-Centric Prompting)

The generation step is performed only when evidence retrieval succeeds. The LLM prompt includes strict instructions:

- Use only the provided research context (no external knowledge).
- Produce a sectioned answer in Markdown with headings.
- Use author-year attribution in-line.
- Avoid a trailing “References” section; integrate citations in the body.

This is intended to produce answers that are both readable and auditable.

### 4.6 Multilingual Queries and Answers

For non-English queries:

- The system detects the input language.
- Translates the query into English to improve PubMed retrieval (which is primarily optimized for English indexing).
- Generates an English answer grounded in English abstracts.
- Optionally translates the final answer to the user’s preferred language.

## 5. Implementation

### 5.1 Backend Pipeline

The backend’s main pipeline executes:

1. PubMed retrieval for the user query (default: up to 8 papers).
2. Context construction from titles/abstracts and citation metadata.
3. LLM answer generation using the constructed context.
4. Citation list return using retrieved paper metadata.

### 5.2 Optional Vector Database

The codebase also includes a vector database service (Pinecone) and embedding support for future hybrid retrieval. In the current “evidence-only” configuration, query answering uses **direct PubMed retrieval**, with vector search reserved for future extensions (e.g., institution-specific corpora, offline indexing, hybrid retrieval).

## 6. Evaluation Plan

This section is intentionally structured as a reproducible plan. If you have logs or benchmark runs, replace “planned” with measured values and add tables.

### 6.1 Tasks and Benchmarks

We propose evaluating MedEvidence AI on:

- **Clinical question answering**: a curated set of clinician-authored questions (or public biomedical QA sets).
- **Literature search utility**: time-to-answer and paper triage comparisons versus manual PubMed search.

### 6.2 Metrics

- **Citation correctness**: proportion of claims that are supported by at least one cited abstract; proportion of citations that are actually relevant to the claim.
- **Factuality**: expert-rated factual accuracy; hallucination rate (claims not supported by retrieved abstracts).
- **Retrieval quality**: top-\(k\) relevance judged by domain experts; nDCG@\(k\) if graded relevance labels are available.
- **Latency**: end-to-end response time from query submission to answer display.
- **User utility**: Likert-scale satisfaction, perceived trustworthiness, and time saved.

### 6.3 Baselines

- **Manual PubMed workflow**: clinician uses PubMed search and reads abstracts directly.
- **LLM-only**: same LLM prompted without retrieved evidence (expected to underperform on provenance).
- **Keyword-only summarization**: top PubMed abstracts concatenated and summarized without citation-centric formatting.

### 6.4 Human Evaluation Protocol

We recommend blinded review by clinicians/researchers:

- Provide the question, system answer, and a link to cited PubMed records.
- Ask reviewers to rate correctness, completeness, and whether citations support key claims.

## 7. Discussion

### 7.1 Strengths

- **Strong provenance story**: citations are derived from retrieved PubMed papers and returned explicitly.
- **Practical retrieval**: direct PubMed retrieval avoids maintaining a large local index and stays up-to-date.
- **Usable output formatting**: structured Markdown answers improve readability and scanning.
- **Multilingual access**: query translation improves accessibility for non-English users.

### 7.2 Limitations

- **Abstract-only grounding**: relying on abstracts may omit important details and nuance from full text.
- **Lexical reranking**: heuristic scoring may miss semantically relevant work compared with embedding-based retrieval.
- **No guarantee of claim-level grounding**: citation lists are returned, but mapping each claim to exact evidence spans is not enforced.
- **PubMed API constraints**: rate limits, occasional timeouts, and metadata variability can affect robustness.

### 7.3 Safety, Ethics, and Intended Use

MedEvidence AI is designed for **research and decision support**, not as a substitute for professional medical judgment. The system should:

- Display a disclaimer that outputs are not medical advice.
- Encourage users to read the cited papers.
- Avoid handling protected health information (PHI) in the MVP deployment unless compliance controls are implemented.

## 8. Conclusion

We presented MedEvidence AI, a PubMed-grounded medical research assistant that couples practical PubMed retrieval with citation-centric generation constraints to deliver evidence-backed answers with explicit provenance. Future work includes hybrid retrieval (vector + keyword), full-text incorporation where available, claim-level evidence linking, and formal user studies in clinical settings.

## Acknowledgments

_Optional._

