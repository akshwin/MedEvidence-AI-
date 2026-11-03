'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Brain,
  BookOpen,
  Code,
  Zap,
  Database,
  Shield,
  ArrowLeft,
  ChevronRight,
  Github,
  FileText,
  Rocket,
  Settings,
  Search,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'
import { useTheme } from '@/lib/theme-context'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const { theme } = useTheme()

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Rocket },
    { id: 'features', title: 'Features', icon: Zap },
    { id: 'architecture', title: 'Architecture', icon: Code },
    { id: 'api', title: 'API Reference', icon: FileText },
    { id: 'setup', title: 'Setup Guide', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform group-hover:scale-105 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    MedEvidence AI
                  </h1>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Documentation
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-200 dark:border-gray-700 hidden md:block" />
              <Link
                href="/"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Contents</span>
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-left ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{section.title}</span>
                      {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 lg:p-12">
              {activeSection === 'getting-started' && (
                <div className="prose prose-emerald dark:prose-invert max-w-none">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white m-0">
                      Getting Started
                    </h1>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Welcome to MedEvidence AI! This guide will help you get started with our
                    evidence-based medical research platform.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    What is MedEvidence AI?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    MedEvidence AI is an advanced medical research platform that provides instant,
                    evidence-based answers from peer-reviewed medical literature. Our AI-powered
                    system searches through <strong>30+ million PubMed citations</strong> to deliver
                    accurate, clinically relevant information with full citations.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Quick Start
                  </h2>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      Two Ways to Search
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                            Ask Clinical Questions
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm m-0">
                            Use the chat interface to ask questions in natural language. Get
                            comprehensive answers with citations from peer-reviewed papers.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                            Search Medical Papers
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm m-0">
                            Search directly through millions of medical papers using advanced
                            semantic search to find relevant clinical studies and research.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Key Features
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        <strong>Evidence-Based:</strong> All answers sourced from peer-reviewed
                        medical literature
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Database className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        <strong>Comprehensive:</strong> Access to 30M+ medical papers from PubMed
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        <strong>Instant Results:</strong> Get answers in seconds with full citations
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {activeSection === 'features' && (
                <div className="prose prose-emerald dark:prose-invert max-w-none">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white m-0">
                      Features
                    </h1>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    MedEvidence AI is packed with powerful features designed specifically for
                    healthcare professionals, researchers, and medical students.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Semantic Search
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Advanced AI-powered search that understands medical terminology and context
                        to find the most relevant papers.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-200 dark:border-teal-700 rounded-xl p-6">
                      <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Full Citations
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Every answer includes complete citations with direct links to PubMed for
                        verification and further reading.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 border border-cyan-200 dark:border-cyan-700 rounded-xl p-6">
                      <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        AI-Powered Analysis
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Leverages advanced language models to synthesize information from multiple
                        sources into coherent answers.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Peer-Reviewed Only
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        All sources are from peer-reviewed medical journals, ensuring the highest
                        quality of clinical evidence.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'architecture' && (
                <div className="prose prose-emerald dark:prose-invert max-w-none">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white m-0">
                      Technical Architecture
                    </h1>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    MedEvidence AI is built on a modern, scalable architecture designed for high
                    performance and reliability.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    System Components
                  </h2>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      Frontend
                    </h3>
                    <ul className="space-y-2 mb-0">
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>Next.js 14:</strong> React framework with App Router
                      </li>
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>TypeScript:</strong> Type-safe development
                      </li>
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>Tailwind CSS:</strong> Utility-first styling
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      Backend
                    </h3>
                    <ul className="space-y-2 mb-0">
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>FastAPI:</strong> High-performance Python API framework
                      </li>
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>LangChain:</strong> RAG pipeline orchestration
                      </li>
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>Anthropic Claude:</strong> Advanced language model
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      Data Layer
                    </h3>
                    <ul className="space-y-2 mb-0">
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>Pinecone:</strong> Vector database for semantic search
                      </li>
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>PubMed API:</strong> Access to 30M+ medical papers
                      </li>
                      <li className="text-gray-600 dark:text-gray-300">
                        <strong>Embeddings:</strong> Semantic vector representations
                      </li>
                    </ul>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    RAG Pipeline
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Our Retrieval-Augmented Generation (RAG) pipeline combines vector search with
                    large language models to provide accurate, cited answers:
                  </p>
                  <ol className="space-y-3">
                    <li className="text-gray-600 dark:text-gray-300">
                      <strong>Query Processing:</strong> User question is converted to embeddings
                    </li>
                    <li className="text-gray-600 dark:text-gray-300">
                      <strong>Vector Search:</strong> Relevant papers retrieved from Pinecone
                    </li>
                    <li className="text-gray-600 dark:text-gray-300">
                      <strong>Context Assembly:</strong> Top papers compiled as context
                    </li>
                    <li className="text-gray-600 dark:text-gray-300">
                      <strong>LLM Generation:</strong> Claude generates answer with citations
                    </li>
                  </ol>
                </div>
              )}

              {activeSection === 'api' && (
                <div className="prose prose-emerald dark:prose-invert max-w-none">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white m-0">
                      API Reference
                    </h1>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    MedEvidence AI provides a RESTful API for programmatic access to our medical
                    research platform.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Endpoints
                  </h2>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded">
                        POST
                      </span>
                      <code className="text-sm text-gray-900 dark:text-white">/api/query</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      Ask a clinical question and receive an evidence-based answer with citations.
                    </p>
                    <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100 m-0">
                        <code>{`{
  "query": "What are the benefits of metformin?",
  "max_papers": 5
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded">
                        POST
                      </span>
                      <code className="text-sm text-gray-900 dark:text-white">/api/search</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      Search for relevant medical papers using semantic search.
                    </p>
                    <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100 m-0">
                        <code>{`{
  "query": "diabetes treatment",
  "limit": 10
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded">
                        GET
                      </span>
                      <code className="text-sm text-gray-900 dark:text-white">
                        /api/search/papers/:id
                      </code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-0">
                      Retrieve detailed information about a specific paper by PubMed ID.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'setup' && (
                <div className="prose prose-emerald dark:prose-invert max-w-none">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white m-0">
                      Setup Guide
                    </h1>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Follow these steps to set up MedEvidence AI for local development.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Prerequisites
                  </h2>
                  <ul className="space-y-2">
                    <li className="text-gray-600 dark:text-gray-300">Node.js 18+ and npm</li>
                    <li className="text-gray-600 dark:text-gray-300">Python 3.9+</li>
                    <li className="text-gray-600 dark:text-gray-300">Git</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Installation
                  </h2>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      1. Clone the Repository
                    </h3>
                    <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100 m-0">
                        <code>
                          git clone https://github.com/yourusername/medevidence-ai.git cd
                          medevidence-ai
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      2. Backend Setup
                    </h3>
                    <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto mb-4">
                      <pre className="text-sm text-gray-100 m-0">
                        <code>{`cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt`}</code>
                      </pre>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-0">
                      Create a <code>.env</code> file with your API keys for Anthropic and Pinecone.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-0">
                      3. Frontend Setup
                    </h3>
                    <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100 m-0">
                        <code>{`cd frontend
npm install
npm run dev`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 my-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-0 flex items-center space-x-2">
                      <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>You're Ready!</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-0">
                      Visit <code>http://localhost:3000</code> to see your application running. The
                      backend API will be available at <code>http://localhost:8000</code>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
