import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppIframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appTitle: string;
  appUrl: string;
}

const AppIframeModal = ({ isOpen, onClose, appTitle, appUrl }: AppIframeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{appTitle}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 relative overflow-hidden">
          <iframe
            src={appUrl}
            className="w-full h-full border-0"
            title={appTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppIframeModal;

