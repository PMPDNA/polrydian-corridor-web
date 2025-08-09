import { useState } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Eye,
  Calendar,
  Clock,
  Share
} from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { ArticleForm } from "@/components/ArticleForm";
import { ArticleShareButtons } from "@/components/ArticleShareButtons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/layouts/AdminLayout";
import { sanitizeHtml } from "@/lib/security";

export default function ArticleManager() {
  const { articles, loading, operationLoading, createArticle, updateArticle, deleteArticle } = useArticles();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const { toast } = useToast();

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveArticle = (article: any) => {
    // ArticleForm now handles saving directly to Supabase
    if (editingArticle) {
      setEditingArticle(null);
    } else {
      setShowCreateDialog(false);
    }
    
    toast({
      title: "Success",
      description: editingArticle ? "Article updated successfully" : "Article created successfully",
    });
  };

  const handleCancel = () => {
    setShowCreateDialog(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      const success = await deleteArticle(id);
      if (success) {
        toast({
          title: "Success",
          description: "Article deleted successfully",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Article Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Article Management">
      <div className="h-full overflow-hidden flex flex-col space-y-6">
        <div className="flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold">Article Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage your articles</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
              </DialogHeader>
              <div className="relative">
                {operationLoading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                    <div className="flex items-center gap-3 bg-card px-6 py-4 rounded-lg border shadow-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm font-medium">Creating article...</span>
                    </div>
                  </div>
                )}
                <ArticleForm onSave={handleSaveArticle} onCancel={handleCancel} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle>Search Articles</CardTitle>
            <CardDescription>Find articles by title or content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4 pb-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  {searchTerm ? "No articles found matching your search." : "No articles yet. Create your first article!"}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {new Date(article.created_at).toLocaleDateString()}
                        </div>
                        {article.updated_at !== article.created_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Updated: {new Date(article.updated_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{article.title}</DialogTitle>
                          </DialogHeader>
                          <div className="prose dark:prose-invert max-w-none">
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: sanitizeHtml(article.content)
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {article.status === 'published' && (
                        <ArticleShareButtons
                          articleId={article.id}
                          title={article.title}
                          content={article.content}
                          size="sm"
                          variant="outline"
                        />
                      )}
                      
                      <Dialog open={editingArticle?.id === article.id} onOpenChange={(open) => !open && setEditingArticle(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingArticle(article)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Article</DialogTitle>
                          </DialogHeader>
                          <ArticleForm 
                            article={article}
                            onSave={handleSaveArticle} 
                            onCancel={handleCancel}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}