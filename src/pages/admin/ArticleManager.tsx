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
  Clock
} from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { ArticleForm } from "@/components/ArticleForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/layouts/AdminLayout";
import { sanitizeHtml } from "@/lib/security";

export default function ArticleManager() {
  const { articles, loading, createArticle, updateArticle, deleteArticle } = useArticles();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const { toast } = useToast();

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveArticle = (article: any) => {
    // Convert to the format expected by useArticles hook
    if (editingArticle) {
      updateArticle(editingArticle.id, {
        title: article.title,
        content: article.content,
        status: 'published'
      }).then(() => {
        setEditingArticle(null);
        toast({
          title: "Success",
          description: "Article updated successfully",
        });
      });
    } else {
      createArticle(article.title, article.content).then(() => {
        setShowCreateDialog(false);
        toast({
          title: "Success",
          description: "Article created successfully",
        });
      });
    }
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Article Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
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
              <ArticleForm onSave={handleSaveArticle} onCancel={handleCancel} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
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

        <div className="grid gap-4">
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
                        {article.content.substring(0, 150)}...
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
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Article</DialogTitle>
                          </DialogHeader>
                          <ArticleForm 
                            article={{
                              id: article.id,
                              title: article.title,
                              content: article.content,
                              excerpt: article.content.substring(0, 150),
                              category: "Strategy" as const,
                              heroImage: "",
                              publishDate: new Date(article.created_at).toISOString().split('T')[0],
                              readTime: 5,
                              linkedinUrl: "",
                              featured: false
                            }}
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
    </AdminLayout>
  );
}