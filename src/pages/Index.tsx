import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Zap, FileText, Palette, ArrowRight, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">Figma JS Generator</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/figma-generator">
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                JS Gen
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Convert Figma Designs to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}JavaScript Code
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Generate comprehensive JavaScript representations of your Figma components with complete metadata, 
              styling information, and design tokens. Perfect for developers who need detailed design specifications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/figma-generator">
              <Button size="lg" className="text-lg px-8 py-6">
                <Code2 className="w-5 h-5 mr-2" />
                Start Generating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need from Figma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract complete design information with a single click
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Complete Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  File information, node IDs, timestamps, and source URLs for full traceability
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-4">
                  <Palette className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Styling & Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Colors, typography, effects, padding, spacing, and all visual properties
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-4">
                  <Code2 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Component Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Complete hierarchy with children, properties, and component definitions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="p-3 bg-orange-100 rounded-xl w-fit mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle>Design Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Bound variables, shared styles, and design system integration
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to get your JavaScript code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Connect to Figma</h3>
              <p className="text-gray-600">
                Paste your Figma URL and provide your personal access token
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Generate Code</h3>
              <p className="text-gray-600">
                Our tool extracts all design data and creates comprehensive JavaScript
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Download & Use</h3>
              <p className="text-gray-600">
                Copy or download the generated JavaScript file for your project
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Convert Your Figma Designs?
          </h2>
          <p className="text-xl opacity-90">
            Start generating comprehensive JavaScript code from your Figma components today
          </p>
          <Link to="/figma-generator">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Code2 className="w-5 h-5 mr-2" />
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">Figma JS Generator</span>
          </div>
          <p className="text-gray-400">
            Convert Figma designs to JavaScript code with complete metadata and styling information
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}