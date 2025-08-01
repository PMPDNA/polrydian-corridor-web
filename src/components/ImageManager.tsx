import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Image, Trash2, Eye, Download, Tag, Search, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface ImageRecord {
  id: string
  name: string
  description?: string
  file_path: string
  file_size?: number
  file_type: string
  alt_text?: string
  category: string
  tags?: string[]
  uploaded_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

const categories = [
  { value: 'article', label: 'Article Images' },
  { value: 'company_logo', label: 'Company Logos' },
  { value: 'event', label: 'Event Photos' },
  { value: 'profile', label: 'Profile Pictures' },
  { value: 'general', label: 'General' },
]

export default function ImageManager() {
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { user, isAdmin } = useSupabaseAuth()
  const { toast } = useToast()

  // Form state for new image upload
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    alt_text: '',
    category: 'general',
    tags: '',
    is_public: true
  })

  useEffect(() => {
    loadImages()
  }, [selectedCategory])

  const loadImages = async () => {
    try {
      let query = supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setImages(data || [])
    } catch (error: any) {
      toast({
        title: "Error Loading Images",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload images.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      // Create database record
      const { error: dbError } = await supabase
        .from('images')
        .insert({
          name: uploadForm.name || file.name,
          description: uploadForm.description,
          file_path: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          alt_text: uploadForm.alt_text,
          category: uploadForm.category,
          tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()) : [],
          uploaded_by: user.id,
          is_public: uploadForm.is_public
        })

      if (dbError) throw dbError

      toast({
        title: "Image Uploaded",
        description: "Image uploaded successfully.",
      })

      // Reset form and reload images
      setUploadForm({
        name: '',
        description: '',
        alt_text: '',
        category: 'general',
        tags: '',
        is_public: true
      })
      loadImages()

    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (imageId: string, filePath: string) => {
    try {
      // Delete from storage
      const fileName = filePath.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('images')
          .remove([fileName])
      }

      // Delete from database
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      toast({
        title: "Image Deleted",
        description: "Image deleted successfully.",
      })
      loadImages()
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const copyImageUrl = (filePath: string) => {
    navigator.clipboard.writeText(filePath)
    toast({
      title: "URL Copied",
      description: "Image URL copied to clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Image Manager</h2>
          <p className="text-muted-foreground">Upload and manage images for articles and company logos</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Image</DialogTitle>
              <DialogDescription>
                Upload an image and add metadata for better organization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Image File</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadForm(prev => ({ ...prev, name: prev.name || file.name }))
                    }
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Image name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Image description"
                />
              </div>
              
              <div>
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  id="alt_text"
                  value={uploadForm.alt_text}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Alt text for accessibility"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="economics, strategy, analysis"
                />
              </div>
              
              <Button 
                onClick={() => {
                  const fileInput = document.getElementById('file') as HTMLInputElement
                  const file = fileInput?.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                }}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={image.file_path}
                  alt={image.alt_text || image.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyImageUrl(image.file_path)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      asChild
                    >
                      <a href={image.file_path} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    {(isAdmin || user?.id === image.uploaded_by) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image.id, image.file_path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm truncate">{image.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.value === image.category)?.label || image.category}
                  </Badge>
                </div>
                
                {image.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {image.description}
                  </p>
                )}
                
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {image.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{image.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {image.file_size && (
                    <span>{(image.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  )}
                  {image.file_size && <span> • </span>}
                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredImages.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Images Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first image to get started.'}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Upload Image</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}