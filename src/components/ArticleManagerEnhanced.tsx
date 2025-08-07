import { useState, useEffect } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArticleForm } from "@/components/ArticleForm";
import { useArticles, type Article } from "@/hooks/useArticles";
import { useToast } from "@/hooks/use-toast";
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";
import { ArticleListSkeleton, FormLoadingOverlay } from "@/components/LoadingStates";
import { sanitizeHtml } from "@/lib/security";
import { 
  Search,
  Plus,
  Eye,
  Share,
  Edit,
  Trash2,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Filter,
  SortAsc,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ArticleManagerEnhanced() {
  const { articles, loading, operationLoading, createArticle, updateArticle, deleteArticle } = useArticles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Filter and sort articles
  const filteredArticles = articles
    ?.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <TrendingUp className="h-3 w-3" />;
      case 'draft': return <FileText className="h-3 w-3" />;
      case 'archived': return <Clock className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const handleCreateArticle = async (article: Article) => {
    try {
      setShowCreateDialog(false);
      toast({
        title: "Article Created",
        description: "Your article has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  const handleUpdateArticle = async (article: Article) => {
    try {
      setShowEditDialog(false);
      setSelectedArticle(null);
      toast({
        title: "Article Updated",
        description: "Your article has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const success = await deleteArticle(id);
      if (success) {
        toast({
          title: "Article Deleted",
          description: "The article has been deleted successfully.",
        });
      }
    }
  };

  const handleShareArticle = async (article: Article) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.meta_description || article.content.substring(0, 200),
          url: `${window.location.origin}/article/${article.id}`,
        });
      } catch (error) {
        console.error('Error sharing article:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = `${window.location.origin}/article/${article.id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Article link copied to clipboard.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <AdminLayout title="Article Manager">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-blue-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-blue-100 rounded w-1/2"></div>
            </div>
          </div>
          <ArticleListSkeleton count={3} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <SafeErrorBoundary>
      <AdminLayout title="Article Manager">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Article Management</h1>
              <p className="text-gray-600">Create, edit, and manage your strategic insights</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredArticles.length}</div>
                <div className="text-sm text-gray-600">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredArticles.filter(a => a.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredArticles.filter(a => a.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Create Button */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
              </DialogHeader>
              <div className="relative">
                {operationLoading && <FormLoadingOverlay message="Creating article..." />}
                <ArticleForm
                  onSave={handleCreateArticle}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6">
          {filteredArticles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters." 
                    : "Get started by creating your first article."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Article
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getStatusColor(article.status)} flex items-center gap-1`}>
                          {getStatusIcon(article.status)}
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </Badge>
                        {article.featured_image && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Featured Image
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {article.title}
                      </CardTitle>
                      
                      <CardDescription className="line-clamp-3">
                        {article.meta_description || article.content.substring(0, 200) + "..."}
                      </CardDescription>
                    </div>
                    
                    {article.featured_image && (
                      <div className="ml-4 flex-shrink-0">
                        <img 
                          src={article.featured_image} 
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(article.created_at)}</span>
                      </div>
                      {article.published_at && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Published {formatDate(article.published_at)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.reading_time_minutes || getReadingTime(article.content)} min read</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* View Article */}
                    <Dialog open={showViewDialog && selectedArticle?.id === article.id} 
                           onOpenChange={(open) => {
                             setShowViewDialog(open);
                             if (!open) setSelectedArticle(null);
                           }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                         <DialogHeader className="flex-shrink-0">
                           <DialogTitle className="line-clamp-2">{selectedArticle?.title}</DialogTitle>
                         </DialogHeader>
                         <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                           {selectedArticle?.featured_image && (
                             <img 
                               src={selectedArticle.featured_image} 
                               alt={selectedArticle.title}
                               className="w-full h-64 object-cover rounded-lg"
                             />
                           )}
                           <div 
                             className="prose prose-lg max-w-none"
                             dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(selectedArticle?.content || "") 
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Share Article */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShareArticle(article)}
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>

                    {/* Edit Article */}
                    <Dialog open={showEditDialog && selectedArticle?.id === article.id} 
                           onOpenChange={(open) => {
                             setShowEditDialog(open);
                             if (!open) setSelectedArticle(null);
                           }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Edit Article</DialogTitle>
                        </DialogHeader>
                        <div className="relative">
                          {operationLoading && <FormLoadingOverlay message="Updating article..." />}
                          <ArticleForm
                            article={selectedArticle!}
                            onSave={handleUpdateArticle}
                            onCancel={() => {
                              setShowEditDialog(false);
                              setSelectedArticle(null);
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Article */}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>

                    {/* External Link if published */}
                    {article.status === 'published' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <a href={`/article/${article.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Live
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      </AdminLayout>
    </SafeErrorBoundary>
  );
}