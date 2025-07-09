import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import FigmaGenerator from './pages/FigmaGenerator';
import EnhancedFigmaGenerator from './pages/EnhancedFigmaGenerator';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { ToastProvider } from './components/Toast/ToastProvider';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/figma-generator" element={<FigmaGenerator />} />
            <Route path="/enhanced-generator" element={<EnhancedFigmaGenerator />} />
            <Route path="/js-generator" element={<EnhancedFigmaGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;