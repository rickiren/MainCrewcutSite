import { useState, useCallback } from 'react';
import { Code, FileCode, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface KickHTMLTemplateInputProps {
  onTemplateSubmit: (html: string, css: string) => void;
  isProcessing?: boolean;
}

const exampleHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    .overlay-container {
      position: relative;
      width: 1920px;
      height: 1080px;
    }
    .webcam {
      position: absolute;
      left: 75%;
      top: 60%;
      width: 20%;
      height: 35%;
      background: rgba(0, 0, 0, 0.8);
      border: 3px solid #00f5ff;
      border-radius: 12px;
    }
    .chat {
      position: absolute;
      left: 5%;
      top: 30%;
      width: 25%;
      height: 60%;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #8338ec;
      border-radius: 8px;
      padding: 10px;
      color: white;
    }
    .label {
      position: absolute;
      left: 5%;
      top: 5%;
      width: 15%;
      height: 5%;
      background: rgba(255, 0, 110, 0.9);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="overlay-container">
    <div class="webcam" data-type="webcam">Webcam</div>
    <div class="chat" data-type="chat">Chat Messages</div>
    <div class="label" data-type="label">Live on Kick</div>
  </div>
</body>
</html>`;

export const KickHTMLTemplateInput: React.FC<KickHTMLTemplateInputProps> = ({
  onTemplateSubmit,
  isProcessing = false,
}) => {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleLoadExample = () => {
    setHtml(exampleHTML);
    setCss('');
  };

  const handleSubmit = () => {
    if (html.trim()) {
      onTemplateSubmit(html, css);
    }
  };

  const readFileContent = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      try {
        const content = await readFileContent(file);
        // Extract HTML and CSS from the file
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Check if parsing was successful
        if (!doc || !doc.documentElement) {
          throw new Error('Invalid HTML structure');
        }
        
        // Check if it's a full HTML document
        const isFullHTML = doc.documentElement.tagName === 'HTML';
        
        // Extract CSS from <style> tags
        const styleTags = doc.querySelectorAll('style');
        const extractedCSS = Array.from(styleTags)
          .map(style => style.textContent || '')
          .join('\n');
        
        // If it's a full HTML document, use the original content
        // Otherwise, extract body content
        let fullHTML = content;
        if (!isFullHTML && doc.body) {
          const bodyHTML = doc.body.innerHTML;
          fullHTML = bodyHTML ? `<div class="overlay-container">${bodyHTML}</div>` : content;
        }
        
        setHtml(fullHTML);
        if (extractedCSS) {
          setCss(extractedCSS);
        }
      } catch (error) {
        console.error('Error reading HTML file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to read HTML file. Please try again.';
        alert(errorMessage);
      }
    } else if (fileName.endsWith('.css')) {
      try {
        const content = await readFileContent(file);
        setCss(content);
      } catch (error) {
        console.error('Error reading CSS file:', error);
        alert('Failed to read CSS file. Please try again.');
      }
    } else {
      alert('Please upload an HTML (.html, .htm) or CSS (.css) file');
    }
  }, [readFileContent]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        await handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300 text-sm font-medium">
          Paste your HTML overlay code or drag & drop an HTML file
        </Label>
        <Button
          onClick={handleLoadExample}
          variant="outline"
          size="sm"
          className="bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs"
        >
          <FileCode className="w-3 h-3 mr-1" />
          Load Example
        </Button>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-purple-500/50 bg-gray-800/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="html-file-upload"
          className="hidden"
          accept=".html,.htm,.css"
          onChange={handleFileInput}
        />
        <label htmlFor="html-file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Drag & drop an HTML file here
              </p>
              <p className="text-xs text-gray-500">
                or click to browse (.html, .htm, .css)
              </p>
            </div>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-400 mb-2 block">HTML</Label>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<div class='overlay-container'>...</div>"
            className="min-h-[300px] bg-gray-700/50 border-gray-600 text-gray-200 font-mono text-sm resize-none"
            disabled={isProcessing}
          />
        </div>

        <div>
          <Label className="text-xs text-gray-400 mb-2 block">
            CSS (optional - can be inline in HTML)
          </Label>
          <Textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder=".your-class { color: blue; }"
            className="min-h-[150px] bg-gray-700/50 border-gray-600 text-gray-200 font-mono text-sm resize-none"
            disabled={isProcessing}
          />
        </div>
      </div>

      <Card className="bg-gray-800/30 border-gray-700 p-3">
        <p className="text-xs text-gray-400 mb-2">💡 Tips:</p>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Drag & drop HTML files directly into the drop zone above</li>
          <li>Use <code className="text-purple-400">position: absolute</code> for positioned elements</li>
          <li>Add <code className="text-purple-400">data-type</code> attributes to identify element types</li>
          <li>Use percentages (%) or pixels (px) for positioning</li>
          <li>Elements will be automatically detected and converted</li>
        </ul>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isProcessing || !html.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Code className="w-4 h-4 mr-2" />
            Parse HTML Template
          </>
        )}
      </Button>
    </div>
  );
};

