'use client';

import { useState } from 'react';
import { 
  Search, 
  FileText, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  Building2,
  Users,
  DollarSign,
  AlertCircle,
  Mail,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Trade Pulse</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#benefits" className="text-slate-600 hover:text-indigo-600 transition-colors">Benefits</a>
              <a href="#insights" className="text-slate-600 hover:text-indigo-600 transition-colors">Sample Insights</a>
              <a href="#access" className="text-slate-600 hover:text-indigo-600 transition-colors">Early Access</a>
            </nav>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50 pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Get Smart. Skip the Noise.
              <span className="block text-indigo-600">NSE Corporate Insights, Delivered.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track significant corporate activity for Indian companies listed on NSE. 
              Our AI analyzes PDF filings and delivers key insights so you don't have to read through every document.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg">
                Get Early Access
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-slate-300 text-slate-700 hover:bg-slate-50">
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-slate-500">Trade Pulse Dashboard</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <FileText className="h-8 w-8 text-slate-400 mb-3" />
                  <div className="text-sm text-slate-600">PDF Filings</div>
                  <div className="text-xs text-slate-500 mt-1">125 documents analyzed</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <Brain className="h-8 w-8 text-indigo-600 mb-3" />
                  <div className="text-sm text-slate-600">AI Analysis</div>
                  <div className="text-xs text-slate-500 mt-1">Key insights extracted</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                  <div className="text-sm text-slate-600">Smart Alerts</div>
                  <div className="text-xs text-slate-500 mt-1">Material events flagged</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our automated system works 24/7 to keep you informed about material corporate events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                <Search className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Scrape NSE Filings</h3>
              <p className="text-slate-600 leading-relaxed">
                We continuously monitor the NSE corporate filings page and extract new PDF documents from the last 7 days
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <Brain className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Analyze with LLM</h3>
              <p className="text-slate-600 leading-relaxed">
                Our Large Language Model processes each document to identify key insights, financial changes, and material events
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <Target className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Deliver Key Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive concise, actionable insights delivered to your dashboard and email, saving you hours of research
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section id="benefits" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why It Matters</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Don't let important corporate developments slip past your radar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-indigo-600 mb-4" />
                <CardTitle className="text-slate-900">Save Time</CardTitle>
                <CardDescription>
                  Skip reading hundreds of pages of corporate filings. Get the key points in minutes, not hours.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-emerald-600 mb-4" />
                <CardTitle className="text-slate-900">First-Mover Advantage</CardTitle>
                <CardDescription>
                  Be among the first to know about material events that could impact stock prices and investment decisions.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-10 w-10 text-amber-600 mb-4" />
                <CardTitle className="text-slate-900">Insight-Driven</CardTitle>
                <CardDescription>
                  Make informed decisions based on AI-processed insights rather than missing critical information in dense documents.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Insights Section */}
      <section id="insights" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Sample Insights</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See the kind of actionable insights you'll receive from our AI analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Positive
                  </Badge>
                  <span className="text-sm text-slate-500">2 hours ago</span>
                </div>
                <CardTitle className="text-slate-900">Reliance Industries - Major Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Reliance announced acquisition of renewable energy assets worth ₹12,000 crores, 
                  signaling strong commitment to green energy transition.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    RELIANCE
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ₹12,000 Cr
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Alert
                  </Badge>
                  <span className="text-sm text-slate-500">5 hours ago</span>
                </div>
                <CardTitle className="text-slate-900">TCS - Leadership Change</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  TCS announced resignation of Chief Technology Officer. Interim replacement appointed 
                  while search for permanent successor continues.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    TCS
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Leadership
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Watch
                  </Badge>
                  <span className="text-sm text-slate-500">1 day ago</span>
                </div>
                <CardTitle className="text-slate-900">HDFC Bank - Quarterly Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  HDFC Bank reported 15% YoY growth in net profit, beating analyst estimates. 
                  Asset quality metrics remain stable with slight improvement in NPA ratios.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    HDFCBANK
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% YoY
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    <Target className="h-3 w-3 mr-1" />
                    Strategic
                  </Badge>
                  <span className="text-sm text-slate-500">1 day ago</span>
                </div>
                <CardTitle className="text-slate-900">Infosys - New Partnership</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Infosys entered strategic partnership with Microsoft to accelerate digital transformation 
                  services for enterprise clients across industries.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    INFY
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Partnership
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Early Access Form */}
      <section id="access" className="py-24 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get Early Access
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Be among the first to experience AI-powered NSE corporate insights. 
            Join our beta program and get updates on launch.
          </p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border-white text-slate-900 placeholder-slate-400"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-white text-indigo-600 hover:bg-slate-50 font-semibold px-8"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Join Beta
                    </div>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-center text-white mb-4">
                <CheckCircle className="h-8 w-8 mr-3" />
                <span className="text-lg font-semibold">You're in!</span>
              </div>
              <p className="text-indigo-100">
                Thanks for joining our beta program. We'll notify you as soon as we launch.
              </p>
            </div>
          )}
          
          <p className="text-sm text-indigo-200 mt-6">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Trade Pulse</span>
              </div>
              <p className="text-slate-400 max-w-md">
                AI-powered corporate insights for Indian stock market investors. 
                Track material events and make informed investment decisions.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              © 2025 Trade Pulse. All rights reserved. Not affiliated with NSE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}