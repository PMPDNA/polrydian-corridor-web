import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  MessageCircle,
  TrendingUp,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useState } from "react";

interface VisualImprovementsProps {
  totalArticles: number;
  categories: string[];
  onCategoryFilter: (category: string | null) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
  selectedCategory?: string | null;
}

export function ArticleVisualImprovements({
  totalArticles,
  categories,
  onCategoryFilter,
  onViewChange,
  currentView,
  selectedCategory
}: VisualImprovementsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Article Collection
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalArticles} strategic insights and analysis articles
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Category Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryFilter(null)}
              >
                All Articles
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalArticles}</div>
              <div className="text-xs text-muted-foreground">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{categories.length}</div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-foreground">
                {Math.round(totalArticles * 7.5)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Read Time (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">Latest</div>
              <div className="text-xs text-muted-foreground">Content Status</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Reading Experience Component
export function ReadingExperienceEnhancements() {
  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-accent/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-2">Enhanced Reading Experience</h3>
            <p className="text-sm text-muted-foreground">
              Clean formatting, proper typography, and optimized content display
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Clean Display</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>No HTML Tags</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>Easy Reading</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}