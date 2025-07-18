import { AdminLayout } from "@/layouts/AdminLayout"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Save, Eye, Monitor } from "lucide-react"

interface HeroContent {
  title: string
  subtitle: string
  description: string
  primaryCTA: string
  secondaryCTA: string
  backgroundImage: string
}

export default function HeroEditor() {
  const { toast } = useToast()
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: "Strategic Solutions for Complex Challenges",
    subtitle: "Transforming Complexity into Clarity",
    description: "Expert guidance through geopolitical friction and market complexity, delivering clear, actionable strategy through corridor economics and disciplined strategic thinking.",
    primaryCTA: "Explore Solutions",
    secondaryCTA: "Schedule Consultation",
    backgroundImage: "/src/assets/polrydian-hero-bg.jpg"
  })

  const [isPreview, setIsPreview] = useState(false)

  const handleSave = () => {
    // Here you would typically save to your backend
    toast({
      title: "Hero Section Updated",
      description: "Changes have been saved successfully.",
    })
  }

  const handleInputChange = (field: keyof HeroContent, value: string) => {
    setHeroContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <AdminLayout title="Hero Section Editor">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Hero Section</h2>
            <p className="text-muted-foreground">Customize the main banner content on your homepage</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreview ? "Edit Mode" : "Preview"}
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Content Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Main Title</Label>
                <Input
                  id="title"
                  value={heroContent.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter main title"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={heroContent.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Enter subtitle"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={heroContent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryCTA">Primary Button Text</Label>
                  <Input
                    id="primaryCTA"
                    value={heroContent.primaryCTA}
                    onChange={(e) => handleInputChange('primaryCTA', e.target.value)}
                    placeholder="Primary CTA"
                  />
                </div>

                <div>
                  <Label htmlFor="secondaryCTA">Secondary Button Text</Label>
                  <Input
                    id="secondaryCTA"
                    value={heroContent.secondaryCTA}
                    onChange={(e) => handleInputChange('secondaryCTA', e.target.value)}
                    placeholder="Secondary CTA"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundImage">Background Image URL</Label>
                <Input
                  id="backgroundImage"
                  value={heroContent.backgroundImage}
                  onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                  placeholder="Image URL"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative min-h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroContent.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="text-white space-y-4">
                  <h2 className="text-sm font-medium text-blue-300 uppercase tracking-wide">
                    {heroContent.subtitle}
                  </h2>
                  <h1 className="text-3xl font-bold leading-tight">
                    {heroContent.title}
                  </h1>
                  <p className="text-lg text-gray-200 max-w-lg">
                    {heroContent.description}
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                      {heroContent.primaryCTA}
                    </button>
                    <button className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10">
                      {heroContent.secondaryCTA}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}