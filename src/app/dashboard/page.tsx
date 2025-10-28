'use client'

import { useState, useEffect } from 'react'

interface Lead {
  title: string
  subreddit: string
  snippet: string
  permalink: string
  author: string
  created_utc: number
  score: number
  matched_keywords: string[]
  ai_relevance_score?: number
}

interface SearchResponse {
  leads: Lead[]
  total_found: number
  message: string
}

interface BusinessOptions {
  businesses: string[]
}

interface IndustryOptions {
  industries: string[]
}

export default function Home() {
  const [businessOptions, setBusinessOptions] = useState<string[]>([])
  const [industryOptions, setIndustryOptions] = useState<string[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState('')
  const [searchCount, setSearchCount] = useState(0)

  // Load business and industry options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [businessRes, industryRes] = await Promise.all([
          fetch('https://hope-backend-final-2-production.up.railway.app/api/leads/business-options'),
          fetch('https://hope-backend-final-2-production.up.railway.app/api/leads/industry-options')
        ])
        
        const businessData: BusinessOptions = await businessRes.json()
        const industryData: IndustryOptions = await industryRes.json()
        
        setBusinessOptions(businessData.businesses)
        setIndustryOptions(industryData.industries)
      } catch (err) {
        console.error('Error loading options:', err)
      }
    }
    
    loadOptions()
  }, [])

  const handleBusinessChange = (business: string) => {
    setSelectedBusiness(business)
    if (business) {
      setSelectedIndustry('') // Clear industry selection
    }
  }

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry)
    if (industry) {
      setSelectedBusiness('') // Clear business selection
    }
  }

  const searchLeads = async () => {
    if (!selectedBusiness && !selectedIndustry) {
      setError('Please select either a business type or industry')
      return
    }
    
    if (!problemDescription.trim()) {
      setError('Please enter a problem description')
      return
    }
    
    setLoading(true)
    setError('')
    setSearchCount(prev => prev + 1)
    
    try {
      // Generate or get unique user ID from localStorage
      const userId = (() => {
        let id = localStorage.getItem('hope_user_id');
        if (!id) {
          id = crypto.randomUUID();
          localStorage.setItem('hope_user_id', id);
        }
        return id;
      })();
      
      const response = await fetch('https://hope-backend-final-2-production.up.railway.app/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business: selectedBusiness || undefined,
          industry: selectedIndustry || undefined,
          problem_description: problemDescription.trim(),
          result_count: limit,
          user_id: userId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SearchResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    if (!selectedBusiness && !selectedIndustry) {
      setError('Please select either a business type or industry')
      return
    }
    
    if (!problemDescription.trim()) {
      setError('Please enter a problem description')
      return
    }
    
    setExporting(true)
    setError('')
    
    try {
      const response = await fetch('https://hope-backend-final-2-production.up.railway.app/api/leads/export/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: results?.leads || [],
          format: 'csv'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'search_results.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = async () => {
    if (!selectedBusiness && !selectedIndustry) {
      setError('Please select either a business type or industry')
      return
    }
    
    if (!problemDescription.trim()) {
      setError('Please enter a problem description')
      return
    }
    
    setExporting(true)
    setError('')
    
    try {
      const response = await fetch('https://hope-backend-final-2-production.up.railway.app/api/leads/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: results?.leads || [],
          format: 'excel'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'search_results.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ScopeIQ
          </h1>
          <p className="text-lg text-gray-600">
            AI-Powered Lead Discovery Platform
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Beta - Powered by Reddit data
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
                </label>
                <select
                  value={selectedBusiness}
                  onChange={(e) => handleBusinessChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a business type</option>
                {businessOptions.map((business) => (
                  <option key={business} value={business}>
                    {business}
                  </option>
                  ))}
                </select>
              </div>

            <div className="text-center text-gray-500">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an industry</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                  ))}
                </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description
              </label>
              <input
                type="text"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="e.g., struggling with getting customers"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && searchLeads()}
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of results
                </label>
                <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                  <option value={100}>100 results</option>
                  <option value={150}>150 results</option>
                </select>
            </div>

            {searchCount >= 4 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-2">
                      Pro Tips for Better Results:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Use specific terms like &quot;struggling&quot;, &quot;can&apos;t&quot;, &quot;need help&quot;, &quot;looking for&quot;</li>
                      <li>Be concrete: &quot;can&apos;t find first customers&quot; vs &quot;growth issues&quot;</li>
                      <li>Try different phrasings to discover new leads</li>
                    </ul>
                  </div>
              </div>
            </div>
            )}

            <div className="flex space-x-4">
            <button
              onClick={searchLeads}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {loading ? 'Searching...' : 'Search Leads'}
              </button>
              
              <button
                onClick={exportToCSV}
                disabled={exporting || loading}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              
              <button
                onClick={exportToExcel}
                disabled={exporting || loading}
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
              <h2 className="text-2xl font-bold text-gray-900">
                  Found {results.total_found} Leads
              </h2>
                <p className="text-gray-600">{results.message}</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={exportToCSV}
                  disabled={exporting}
                  className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 disabled:bg-green-300 transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
                
                <button
                  onClick={exportToExcel}
                  disabled={exporting}
                  className="bg-purple-600 text-white py-1 px-3 rounded text-sm hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export Excel'}
                </button>
              </div>
              </div>
            
            <div className="space-y-4">
              {results.leads.map((lead, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {lead.title}
                    </h3>
                    {lead.ai_relevance_score !== undefined && (
                      <span className="text-sm text-gray-500 ml-4">
                        Score: {lead.ai_relevance_score}
                        </span>
                      )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    u/{lead.author} • r/{lead.subreddit} • {formatDate(lead.created_utc)}
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    {lead.snippet}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Keywords: {lead.matched_keywords.join(', ')}
                    </div>
                    <a
                      href={lead.permalink}
          target="_blank"
          rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Post →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}





























