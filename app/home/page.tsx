'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage('Please enter a company name');
      setSuccessMessage('');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Call Express.js API server on port 3001
      const response = await fetch('http://localhost:3001/api/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: searchQuery.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'accepted') {
        setSuccessMessage('Analysis started. Check back soon.');
        setSearchQuery(''); // Clear the search field on success
      } else {
        setErrorMessage(data.message || 'Failed to start analysis');
      }
    } catch (error) {
      console.error('Error calling analyze API:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Trade Pulse</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</a>
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Insights</a>
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Alerts</a>
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Settings</a>
            </nav>
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Page Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Search NSE-Listed Company
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get instant insights from corporate filings of the last 7 days.
          </p>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Enter company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="pl-12 pr-4 py-4 text-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
              />
            </div>
            
            <Button 
              size="lg" 
              onClick={handleAnalyze}
              disabled={isLoading || !searchQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>

            {/* Success Message */}
            {successMessage && (
              <Alert className="mt-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert className="mt-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Search</h3>
              <p className="text-slate-600 text-sm">
                Search by company name, ticker symbol, or industry to find relevant insights.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Analysis</h3>
              <p className="text-slate-600 text-sm">
                Get AI-powered insights from the latest corporate filings and announcements.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">7</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">7-Day Coverage</h3>
              <p className="text-slate-600 text-sm">
                Access insights from corporate filings published in the last 7 days.
              </p>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-12">
            <p className="text-sm text-slate-500 mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Reliance Industries', 'TCS', 'HDFC Bank', 'Infosys', 'ICICI Bank', 'Wipro'].map((company) => (
                <button
                  key={company}
                  onClick={() => setSearchQuery(company)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}