// Cleanup utility to identify and remove unused components
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle } from "lucide-react";

interface UnusedComponent {
  name: string;
  path: string;
  lastModified: string;
  size: number;
  reason: string;
}

// List of potentially unused components identified
const potentiallyUnusedComponents: UnusedComponent[] = [
  {
    name: "ArticleVisualImprovements",
    path: "src/components/ArticleVisualImprovements.tsx",
    lastModified: "2024-01-15",
    size: 3500,
    reason: "No imports found in active codebase"
  },
  {
    name: "ArticleCorruptionTest", 
    path: "src/components/ArticleCorruptionTest.tsx",
    lastModified: "2024-01-10",
    size: 2800,
    reason: "Testing component, not used in production"
  },
  {
    name: "ThinkTankModal",
    path: "src/components/ThinkTankModal.tsx", 
    lastModified: "2024-01-05",
    size: 1200,
    reason: "Replaced by integrated modal system"
  },
  {
    name: "LoadingStates",
    path: "src/components/LoadingStates.tsx",
    lastModified: "2024-01-12", 
    size: 2200,
    reason: "Replaced by unified LoadingSpinner component"
  },
  {
    name: "ProofChips",
    path: "src/components/ProofChips.tsx",
    lastModified: "2024-01-08",
    size: 1500,
    reason: "Experimental component, no longer used"
  }
];

// Unused utility files
const potentiallyUnusedUtils: UnusedComponent[] = [
  {
    name: "dataMigration.ts",
    path: "src/utils/dataMigration.ts",
    lastModified: "2024-01-10",
    size: 4500,
    reason: "One-time migration utility"
  },
  {
    name: "systemStressTest.ts", 
    path: "src/utils/systemStressTest.ts",
    lastModified: "2024-01-15",
    size: 3200,
    reason: "Development testing utility"
  }
];

export function CleanupUnused() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectItem = (path: string) => {
    setSelectedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const handleCleanupSelected = () => {
    console.log("Would remove:", selectedItems);
    // In a real implementation, this would:
    // 1. Verify no active imports exist
    // 2. Create backup copies
    // 3. Remove files
    // 4. Update any references
    alert(`Would remove ${selectedItems.length} files. This is a simulation.`);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const allItems = [...potentiallyUnusedComponents, ...potentiallyUnusedUtils];
  const totalSize = allItems.reduce((sum, item) => sum + item.size, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Code Cleanup Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Identified {allItems.length} potentially unused files totaling {formatFileSize(totalSize)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Cleanup Recommendations</span>
              </div>
              <ul className="mt-2 text-sm text-orange-700 space-y-1">
                <li>• Review each file before removal</li>
                <li>• Check for dynamic imports or lazy loading</li>
                <li>• Create backups before deletion</li>
                <li>• Test thoroughly after cleanup</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Components ({potentiallyUnusedComponents.length})</h3>
              {potentiallyUnusedComponents.map((component) => (
                <div key={component.path} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(component.path)}
                      onChange={() => handleSelectItem(component.path)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{component.name}</p>
                      <p className="text-sm text-muted-foreground">{component.path}</p>
                      <p className="text-xs text-muted-foreground">{component.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{formatFileSize(component.size)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{component.lastModified}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Utilities ({potentiallyUnusedUtils.length})</h3>
              {potentiallyUnusedUtils.map((util) => (
                <div key={util.path} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(util.path)}
                      onChange={() => handleSelectItem(util.path)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{util.name}</p>
                      <p className="text-sm text-muted-foreground">{util.path}</p>
                      <p className="text-xs text-muted-foreground">{util.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{formatFileSize(util.size)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{util.lastModified}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedItems.length} files selected
              </p>
              <Button 
                onClick={handleCleanupSelected}
                disabled={selectedItems.length === 0}
                variant="destructive"
              >
                Remove Selected Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}