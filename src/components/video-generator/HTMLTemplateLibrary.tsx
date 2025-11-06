import { useState, useRef } from 'react';
import { Code, FileCode, Layers, Grid, Layout, Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HTMLTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  html: string;
  css: string;
  preview?: string;
}

const starterTemplates: HTMLTemplate[] = [
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Classic hero banner with CTA',
    icon: <Layout className="w-6 h-6" />,
    html: `<div class="hero">
  <h1 class="hero-title">Welcome to Our Platform</h1>
  <p class="hero-subtitle">Create amazing experiences with ease</p>
  <button class="cta-button">Get Started</button>
</div>`,
    css: `.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: scale(1.05);
}`,
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    description: 'Responsive card layout',
    icon: <Grid className="w-6 h-6" />,
    html: `<div class="card-grid">
  <div class="card">
    <div class="card-icon">🚀</div>
    <h3>Fast</h3>
    <p>Lightning-fast performance</p>
  </div>
  <div class="card">
    <div class="card-icon">🎨</div>
    <h3>Beautiful</h3>
    <p>Stunning visual designs</p>
  </div>
  <div class="card">
    <div class="card-icon">⚡</div>
    <h3>Powerful</h3>
    <p>Advanced features built-in</p>
  </div>
</div>`,
    css: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.card p {
  color: #666;
  font-size: 0.95rem;
}`,
  },
  {
    id: 'glassmorphic',
    name: 'Glassmorphic Card',
    description: 'Modern frosted glass effect',
    icon: <Layers className="w-6 h-6" />,
    html: `<div class="glass-container">
  <div class="glass-card">
    <h2 class="glass-title">Glassmorphism</h2>
    <p class="glass-text">A modern design trend with frosted glass aesthetics</p>
    <button class="glass-button">Explore More</button>
  </div>
</div>`,
    css: `.glass-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  text-align: center;
}

.glass-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
}

.glass-text {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.glass-button {
  padding: 0.875rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}`,
  },
  {
    id: 'pricing-table',
    name: 'Pricing Table',
    description: 'Simple pricing comparison',
    icon: <FileCode className="w-6 h-6" />,
    html: `<div class="pricing-section">
  <div class="pricing-card">
    <h3>Basic</h3>
    <div class="price">$9<span>/mo</span></div>
    <ul class="features">
      <li>✓ 10 Projects</li>
      <li>✓ 5GB Storage</li>
      <li>✓ Email Support</li>
    </ul>
    <button class="pricing-button">Choose Plan</button>
  </div>
  <div class="pricing-card featured">
    <h3>Pro</h3>
    <div class="price">$29<span>/mo</span></div>
    <ul class="features">
      <li>✓ Unlimited Projects</li>
      <li>✓ 100GB Storage</li>
      <li>✓ Priority Support</li>
    </ul>
    <button class="pricing-button">Choose Plan</button>
  </div>
</div>`,
    css: `.pricing-section {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  justify-content: center;
  background: #f5f5f5;
}

.pricing-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  transition: transform 0.3s;
}

.pricing-card.featured {
  border: 2px solid #667eea;
  transform: scale(1.05);
}

.pricing-card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.price {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 2rem;
}

.price span {
  font-size: 1.25rem;
  color: #999;
}

.features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: left;
}

.features li {
  padding: 0.5rem 0;
  color: #666;
}

.pricing-button {
  width: 100%;
  padding: 0.875rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.pricing-button:hover {
  background: #5568d3;
}`,
  },
];

interface HTMLTemplateLibraryProps {
  onTemplateSelect: (html: string, css: string) => void;
}

export const HTMLTemplateLibrary: React.FC<HTMLTemplateLibraryProps> = ({
  onTemplateSelect,
}) => {
  const [customHTML, setCustomHTML] = useState('');
  const [customCSS, setCustomCSS] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateClick = (template: HTMLTemplate) => {
    onTemplateSelect(template.html, template.css);
  };

  const parseHTMLFile = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    let extractedHTML = '';
    let extractedCSS = '';

    // Extract CSS from <style> tags
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach(style => {
      extractedCSS += style.textContent + '\n';
    });

    // Extract inline styles from style attribute on body
    const body = doc.querySelector('body');
    if (body) {
      const bodyStyle = body.getAttribute('style');
      if (bodyStyle) {
        extractedCSS = `body { ${bodyStyle} }\n` + extractedCSS;
      }
    }

    // Get the body content or full HTML if no body
    if (body && body.innerHTML.trim()) {
      extractedHTML = body.innerHTML;
    } else {
      extractedHTML = htmlContent;
    }

    return { html: extractedHTML, css: extractedCSS };
  };

  const handleFileUpload = (file: File) => {
    if (file.type === 'text/html' || file.name.endsWith('.html')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const { html, css } = parseHTMLFile(content);
        setCustomHTML(html);
        setCustomCSS(css);
        setUploadedFileName(file.name);
        onTemplateSelect(html, css);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload an HTML file (.html)');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCustomSubmit = () => {
    if (customHTML.trim()) {
      onTemplateSelect(customHTML, customCSS);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,text/html"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload HTML</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Code</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onClick={handleBrowseClick}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {uploadedFileName ? 'File Uploaded!' : 'Drop your HTML file here'}
            </h3>
            {uploadedFileName ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <File className="w-5 h-5" />
                  <span className="font-medium">{uploadedFileName}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your HTML has been loaded and is ready to customize!
                </p>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  className="mt-2"
                >
                  Upload Different File
                </Button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  or click to browse your files
                </p>
                <p className="text-sm text-gray-500">
                  Upload an HTML file to use as your starting template
                </p>
              </>
            )}
          </div>

          {uploadedFileName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your HTML is now displayed in the preview</li>
                <li>• Click on elements to select and edit them</li>
                <li>• Drag elements to reposition them</li>
                <li>• Use the properties panel to customize styles</li>
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <ScrollArea className="h-[500px] pr-4">
            <div className="grid grid-cols-1 gap-4">
              {starterTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 overflow-x-auto">
                        <pre>{template.html.split('\n').slice(0, 3).join('\n')}...</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              HTML
            </label>
            <Textarea
              value={customHTML}
              onChange={(e) => setCustomHTML(e.target.value)}
              placeholder="<div>Your custom HTML here...</div>"
              className="font-mono text-sm min-h-[200px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              CSS (optional)
            </label>
            <Textarea
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              placeholder=".your-class { color: blue; }"
              className="font-mono text-sm min-h-[150px]"
            />
          </div>
          <Button
            onClick={handleCustomSubmit}
            disabled={!customHTML.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Code className="w-4 h-4 mr-2" />
            Use Custom Template
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
