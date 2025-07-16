import { useAccessibility } from '@/hooks/useAccessibility';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCcw, Contrast } from 'lucide-react';

export const AccessibilityMenu = () => {
  const {
    fontSize,
    highContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
  } = useAccessibility();

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg" role="region" aria-label="Accessibility controls">
      <CardHeader>
        <CardTitle className="text-sm">Accessibility Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Font Size</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize === 'normal'}
              aria-label="Decrease font size"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFontSize}
              aria-label="Reset font size"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={fontSize === 'extra-large'}
              aria-label="Increase font size"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">High Contrast</span>
          <Button
            variant={highContrast ? "default" : "outline"}
            size="sm"
            onClick={toggleHighContrast}
            aria-label="Toggle high contrast mode"
            aria-pressed={highContrast}
          >
            <Contrast className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Current: {fontSize} font, {highContrast ? 'high' : 'normal'} contrast
        </div>
      </CardContent>
    </Card>
  );
};