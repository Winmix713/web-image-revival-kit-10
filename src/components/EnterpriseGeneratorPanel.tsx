import React from 'react';
import { Rocket, Building, Users, Shield, Zap, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface EnterpriseGeneratorPanelProps {
  figmaData?: any;
}

export const EnterpriseGeneratorPanel: React.FC<EnterpriseGeneratorPanelProps> = ({ figmaData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Rocket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Panel</h3>
        <p className="text-gray-600 mb-6">
          Advanced enterprise features for large-scale design systems and team collaboration.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Design System Management</h4>
                <p className="text-sm text-gray-500">Centralized design token management</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="outline">Token Management</Badge>
              <Badge variant="outline">Version Control</Badge>
              <Badge variant="outline">Multi-brand</Badge>
            </div>
            <Badge variant="secondary">Enterprise Feature</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Team Collaboration</h4>
                <p className="text-sm text-gray-500">Advanced team workflows</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="outline">Role Management</Badge>
              <Badge variant="outline">Approval Workflows</Badge>
              <Badge variant="outline">Team Analytics</Badge>
            </div>
            <Badge variant="secondary">Enterprise Feature</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Security & Compliance</h4>
                <p className="text-sm text-gray-500">Enterprise-grade security</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="outline">SSO Integration</Badge>
              <Badge variant="outline">Audit Logs</Badge>
              <Badge variant="outline">GDPR Compliant</Badge>
            </div>
            <Badge variant="secondary">Enterprise Feature</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold">API & Integrations</h4>
                <p className="text-sm text-gray-500">Custom integrations and APIs</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="outline">REST API</Badge>
              <Badge variant="outline">Webhooks</Badge>
              <Badge variant="outline">CI/CD Integration</Badge>
            </div>
            <Badge variant="secondary">Enterprise Feature</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Globe className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold">Multi-Platform Export</h4>
                <p className="text-sm text-gray-500">Export to multiple platforms</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="outline">iOS</Badge>
              <Badge variant="outline">Android</Badge>
              <Badge variant="outline">Web</Badge>
            </div>
            <Badge variant="secondary">Enterprise Feature</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold">Custom Branding</h4>
                <p className="text-sm text-gray-500">White-label solutions</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="outline">Custom Domain</Badge>
              <Badge variant="outline">Brand Colors</Badge>
              <Badge variant="outline">Custom Logo</Badge>
            </div>
            <Badge variant="secondary">Enterprise Feature</Badge>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Interested in Enterprise Features?</h4>
          <p className="text-sm text-gray-600 mb-4">
            Contact our sales team to learn more about enterprise pricing and features.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseGeneratorPanel;