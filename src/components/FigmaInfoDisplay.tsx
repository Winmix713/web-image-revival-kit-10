import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { FigmaApiResponse } from '../types/figma';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Calendar, 
  Layers, 
  Palette, 
  Component, 
  Type, 
  Square, 
  Circle, 
  XIcon as LucideIcon, 
  Code2, 
  Package, 
  Rocket,
  Search,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Plus,
  Minus,
  AlertTriangle,
  ChevronRight,
  Eye,
  Copy,
  ExternalLink,
  Users,
  Clock,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Star,
  Heart,
  Bookmark,
  LucideProps
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// Type for Lucide icon components
type IconComponent = React.ComponentType<LucideProps>;

// Lazy load heavy components
const LazyDesignSystemPanel = lazy(() => import('./DesignSystemPanel').then(module => ({ default: module.DesignSystemPanel })));
const LazyCodeGenerationPanel = lazy(() => import('./CodeGenerationPanel').then(module => ({ default: module.CodeGenerationPanel })));
const LazyEnterpriseGeneratorPanel = lazy(() => import('./EnterpriseGeneratorPanel').then(module => ({ default: module.EnterpriseGeneratorPanel })));

interface FigmaInfoDisplayProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

interface ProcessedDocument {
  allNodes: (any & { depth: number })[];
  nodeCounts: Record<string, number>;
  extractedColors: ColorInfo[];
  complexityScore: number;
}

interface ColorInfo {
  hex: string;
  usage: number;
  name?: string;
}

interface StatItem {
  label: string;
  value: number;
  percentage: number;
  icon: IconComponent;
  color: string;
  trend?: number;
}

interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
}

interface QuickActionProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Component Skeleton for loading states
const ComponentSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Animated Counter Component
const CountUp: React.FC<{ end: number; duration?: number }> = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}</span>;
};

// Filter Button Component
const FilterButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ 
  active, 
  onClick, 
  children 
}) => (
  <Button
    variant={active ? "default" : "outline"}
    size="sm"
    onClick={onClick}
    className={`transition-all duration-200 ${active ? 'shadow-md' : 'hover:shadow-sm'}`}
  >
    {children}
  </Button>
);

// Enhanced Color Palette Component
const ColorPalette: React.FC<{ colors: ColorInfo[] }> = ({ colors }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Kinyert Színpaletta</span>
        </h4>
        <Badge variant="secondary">{colors.length} szín</Badge>
      </div>
      <div className="grid grid-cols-8 md:grid-cols-12 gap-3">
        {colors.map((color, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="relative aspect-square rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copiedColor === color.hex && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-mono text-sm">{color.hex}</div>
                  <div className="text-xs text-gray-500">{color.usage}x használat</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

// Enhanced Stats Component
const EnhancedStats: React.FC<{ stats: StatItem[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative overflow-hidden text-center p-6 bg-gradient-to-br ${stat.color} rounded-xl shadow-sm hover:shadow-lg transition-all duration-300`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-white/20 rounded-full">
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            <CountUp end={stat.value} duration={2} />
          </div>
          <div className="text-sm text-white/90 mb-3">{stat.label}</div>
          <Progress value={stat.percentage} className="h-2 bg-white/20" />
          {stat.trend && (
            <div className={`flex items-center justify-center mt-2 text-xs ${stat.trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {stat.trend > 0 ? '+' : ''}{stat.trend}%
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
      </motion.div>
    ))}
  </div>
);

// Quick Actions Panel
const QuickActionsPanel: React.FC<{ onRefresh: () => void; onExport: () => void; onShare: () => void }> = ({
  onRefresh,
  onExport,
  onShare
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed bottom-6 right-6 z-50"
  >
    <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onRefresh} className="rounded-full">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Frissítés</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="rounded-full">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport()}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Jelentés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport()}>
                  <Code2 className="w-4 h-4 mr-2" />
                  JSON Adatok
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport()}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  CSV Táblázat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>Exportálás</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onShare} className="rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Megosztás</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </motion.div>
);

// Changes Detection Component with JavaScript Code Actions
const ChangesDetection: React.FC<{ hasChanges: boolean; generatedCode: string }> = ({ hasChanges, generatedCode }) => {
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([generatedCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figma-component.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!hasChanges) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Változások észlelve</span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Plus className="w-4 h-4 text-green-600" />
            <span>3 új komponens hozzáadva</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Minus className="w-4 h-4 text-red-600" />
            <span>1 komponens törölve</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>2 komponens módosítva</span>
          </div>
        </div>
        
        {/* JavaScript Code Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
            <Eye className="w-4 h-4 mr-1" />
            Megtekintés
          </Button>
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            {copySuccess ? (
              <>
                <Star className="w-4 h-4 mr-1 text-green-600" />
                Másolva!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Másolás
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadFile}>
            <Download className="w-4 h-4 mr-1" />
            Letöltés
          </Button>
        </div>
      </motion.div>

      {/* Modal for viewing code */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[80vh] bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Generált JavaScript Kód</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    {copySuccess ? (
                      <>
                        <Star className="w-4 h-4 mr-1 text-green-600" />
                        Másolva!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Másolás
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadFile}>
                    <Download className="w-4 h-4 mr-1" />
                    Letöltés
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowModal(false)}>
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[60vh]">
                <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Collaboration Panel
const CollaborationPanel: React.FC = () => {
  const collaborators = [
    { id: 1, name: 'Anna Kovács', avatar: '', role: 'Designer' },
    { id: 2, name: 'Péter Nagy', avatar: '', role: 'Developer' },
    { id: 3, name: 'Mária Szabó', avatar: '', role: 'PM' },
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex -space-x-2">
          {collaborators.map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="border-2 border-white w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          <Users className="w-4 h-4 inline mr-1" />
          {collaborators.length} aktív közreműködő
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Activity className="w-4 h-4" />
        <span>Utolsó aktivitás: 5 perce</span>
      </div>
    </div>
  );
};

// Main Component
export function FigmaInfoDisplay({ figmaData, fileKey }: FigmaInfoDisplayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'components' | 'styles'>('all');
  const [hasChanges, setHasChanges] = useState(true); // Simulate changes detection
  const [showLightbox, setShowLightbox] = useState(false);

  // Generate sample JavaScript code for the changes detection
  const generatedJavaScriptCode = `/**
 * Figma Component Export
 * Generated: ${new Date().toISOString()}
 * File: ${figmaData.name}
 */

const figmaComponent = {
  name: "${figmaData.name}",
  fileKey: "${fileKey}",
  lastModified: "${figmaData.lastModified}",
  version: "${figmaData.version}",
  
  // Component structure
  document: ${JSON.stringify(figmaData.document, null, 2)},
  
  // Components
  components: ${JSON.stringify(figmaData.components, null, 2)},
  
  // Styles
  styles: ${JSON.stringify(figmaData.styles, null, 2)},
  
  // Helper methods
  getComponentById(id) {
    return this.components[id] || null;
  },
  
  getStyleById(id) {
    return this.styles[id] || null;
  },
  
  getAllTextNodes() {
    const textNodes = [];
    const traverse = (node) => {
      if (node.type === 'TEXT') {
        textNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.document);
    return textNodes;
  }
};

// Export for use
export default figmaComponent;`;

  // Helper functions
  const rgbaToHex = (color: any): string => {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('hu-HU');
  };

  const getNodeTypeIcon = (type: string): IconComponent => {
    const iconMap: Record<string, IconComponent> = {
      TEXT: Type,
      RECTANGLE: Square,
      ELLIPSE: Circle,
      FRAME: Layers,
      COMPONENT: Component,
      INSTANCE: Component,
      DEFAULT: Square,
    };
    return iconMap[type] || iconMap.DEFAULT;
  };

  // Process Figma data with enhanced analysis
  const { allNodes, nodeCounts, extractedColors, complexityScore } = useMemo(() => {
    if (!figmaData?.document) {
      return { allNodes: [], nodeCounts: {}, extractedColors: [], complexityScore: 0 };
    }

    const allNodes: (any & { depth: number })[] = [];
    const nodeCounts: Record<string, number> = {};
    const colorMap = new Map<string, number>();
    let complexity = 0;

    const traverse = (node: any, depth = 0) => {
      allNodes.push({ ...node, depth });
      nodeCounts[node.type] = (nodeCounts[node.type] || 0) + 1;
      
      // Extract colors
      if (node.backgroundColor) {
        const hex = rgbaToHex(node.backgroundColor);
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
      
      if (node.fills) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = rgbaToHex(fill.color);
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
          }
        });
      }

      // Calculate complexity
      complexity += depth * 0.1;
      if (node.effects?.length > 0) complexity += 2;
      if (node.children?.length > 5) complexity += 1;

      if (node.children) {
        node.children.forEach((child: any) => traverse(child, depth + 1));
      }
    };

    traverse(figmaData.document);

    const extractedColors: ColorInfo[] = Array.from(colorMap.entries())
      .map(([hex, usage]) => ({ hex, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 24); // Top 24 colors

    return { allNodes, nodeCounts, extractedColors, complexityScore: Math.round(complexity) };
  }, [figmaData.document]);

  const componentCount = Object.keys(figmaData.components || {}).length;
  const styleCount = Object.keys(figmaData.styles || {}).length;

  // Enhanced statistics
  const stats: StatItem[] = [
    {
      label: 'Összes elem',
      value: allNodes.length,
      percentage: 100,
      icon: Layers,
      color: 'from-blue-500 to-blue-600',
      trend: 12
    },
    {
      label: 'Komponensek',
      value: componentCount,
      percentage: (componentCount / Math.max(allNodes.length, 1)) * 100,
      icon: Component,
      color: 'from-green-500 to-green-600',
      trend: 8
    },
    {
      label: 'Stílusok',
      value: styleCount,
      percentage: (styleCount / Math.max(allNodes.length, 1)) * 100,
      icon: Palette,
      color: 'from-purple-500 to-purple-600',
      trend: -3
    },
    {
      label: 'Komplexitás',
      value: complexityScore,
      percentage: Math.min(complexityScore, 100),
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      trend: 5
    }
  ];

  const handleRefresh = () => {
    console.log('Refreshing data...');
    // Implement refresh logic
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // Implement export logic
  };

  const handleShare = () => {
    console.log('Sharing...');
    // Implement share logic
  };

  // Filter logic
  const filteredData = useMemo(() => {
    if (filter === 'components') {
      return Object.entries(figmaData.components || {});
    } else if (filter === 'styles') {
      return Object.entries(figmaData.styles || {});
    }
    return allNodes;
  }, [filter, figmaData.components, figmaData.styles, allNodes]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <button className="hover:text-gray-700 transition-colors">Kezdőlap</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{figmaData.name}</span>
      </nav>

      {/* Changes Detection with JavaScript Code Actions */}
      <ChangesDetection hasChanges={hasChanges} generatedCode={generatedJavaScriptCode} />

      {/* Collaboration Panel */}
      <CollaborationPanel />

      {/* Enhanced Stats */}
      <EnhancedStats stats={stats} />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Fájl Információk</span>
          </TabsTrigger>
          <TabsTrigger value="design-system" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Design System</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Code2 className="w-4 h-4" />
            <span>Kód Generálás</span>
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="flex items-center space-x-2">
            <Rocket className="w-4 h-4" />
            <span>Enterprise</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-8">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Keresés komponensekben, stílusokban, színekben..."
                    className="pl-10 pr-4 py-3 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                    <Filter className="w-4 h-4 mr-1" />
                    Összes
                  </FilterButton>
                  <FilterButton active={filter === 'components'} onClick={() => setFilter('components')}>
                    <Component className="w-4 h-4 mr-1" />
                    Komponensek ({componentCount})
                  </FilterButton>
                  <FilterButton active={filter === 'styles'} onClick={() => setFilter('styles')}>
                    <Palette className="w-4 h-4 mr-1" />
                    Stílusok ({styleCount})
                  </FilterButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Fájl Információk</span>
                <Badge variant="secondary" className="ml-auto">
                  v{figmaData.version}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fájl neve</label>
                    <p className="text-lg font-semibold">{figmaData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fájl kulcs</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{fileKey}</p>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(fileKey)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Utolsó módosítás</label>
                    <p className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(figmaData.lastModified)}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Szerepkör</label>
                      <Badge variant="secondary">{figmaData.role}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Szerkesztő típus</label>
                      <Badge variant="outline">{figmaData.editorType}</Badge>
                    </div>
                  </div>
                </div>
                
                {figmaData.thumbnailUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Előnézeti kép</label>
                    <div className="relative group">
                      <img 
                        src={figmaData.thumbnailUrl} 
                        alt="Figma fájl előnézet"
                        className="max-w-full rounded-lg border border-gray-200 transition-transform duration-300 group-hover:scale-105 cursor-zoom-in shadow-sm"
                        onClick={() => setShowLightbox(true)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card>
            <CardContent className="pt-6">
              <ColorPalette colors={extractedColors} />
            </CardContent>
          </Card>

          {/* Node Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Elem Típusok Megoszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(nodeCounts).map(([type, count]) => {
                  const IconComponent = getNodeTypeIcon(type);
                  const percentage = (count / allNodes.length) * 100;
                  
                  return (
                    <motion.div 
                      key={type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{type}</span>
                          <Badge variant="secondary" className="text-xs">{count}</Badge>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Components and Styles */}
          {componentCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Component className="w-5 h-5" />
                  <span>Komponensek ({componentCount})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(figmaData.components || {}).map(([key, component]) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Component className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{component.name}</h4>
                            <p className="text-sm text-gray-500">Komponens</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Star className="w-3 h-3 mr-1" />
                            Kész
                          </Badge>
                        </div>
                      </div>
                      
                      {component.description && (
                        <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-mono">ID: {component.key}</p>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {component.componentSetId && (
                        <Badge variant="outline" className="mt-3">Komponens készlet</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumentum Struktúra (első 50 elem)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs border rounded-md p-4 bg-gray-50">
                <AnimatePresence>
                  {allNodes.slice(0, 50).map((node, index) => {
                    const IconComponent = getNodeTypeIcon(node.type);
                    return (
                      <motion.div 
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.01 }}
                        className="flex items-center space-x-2 py-1 hover:bg-gray-100 rounded px-2 transition-colors"
                        style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
                      >
                        <IconComponent className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="truncate" title={node.name}>{node.name || 'Névtelen'}</span>
                        <span className="text-gray-400">({node.type})</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {allNodes.length > 50 && (
                  <div className="text-center py-2 text-gray-500">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    ... és még {allNodes.length - 50} elem
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design-system">
          <Suspense fallback={<ComponentSkeleton />}>
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Design System Panel</h3>
              <p className="text-gray-600">Ez a funkció hamarosan elérhető lesz.</p>
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="generate">
          <LazyCodeGenerationPanel figmaData={figmaData} fileKey={fileKey} />
        </TabsContent>

        <TabsContent value="enterprise">
          <Suspense fallback={<ComponentSkeleton />}>
            <div className="text-center py-12">
              <Rocket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Panel</h3>
              <p className="text-gray-600">Ez a funkció hamarosan elérhető lesz.</p>
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Panel */}
      <QuickActionsPanel 
        onRefresh={handleRefresh}
        onExport={handleExport}
        onShare={handleShare}
      />

      {/* Lightbox for image preview */}
      {showLightbox && figmaData.thumbnailUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={figmaData.thumbnailUrl}
            alt="Figma fájl előnézet"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </div>
  );
}
