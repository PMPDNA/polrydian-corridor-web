import { AdminLayout } from "@/layouts/AdminLayout";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import { 
  Save, 
  Eye, 
  Monitor, 
  Home, 
  User, 
  Briefcase, 
  Mail, 
  Undo2,
  Settings
} from "lucide-react";

interface ContentEditor {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  description?: string;
}

const contentSections = {
  hero: {
    title: "Hero Section",
    icon: Home,
    description: "Main homepage banner content",
    editors: [
      { id: 'title', label: 'Main Title', type: 'text' as const },
      { id: 'subtitle', label: 'Subtitle', type: 'text' as const },
      { id: 'description', label: 'Description', type: 'textarea' as const },
      { id: 'primary_cta', label: 'Primary Button Text', type: 'text' as const },
      { id: 'secondary_cta', label: 'Secondary Button Text', type: 'text' as const }
    ]
  },
  about: {
    title: "About Section",
    icon: User,
    description: "About page content",
    editors: [
      { id: 'title', label: 'Section Title', type: 'text' as const },
      { id: 'subtitle', label: 'Subtitle', type: 'text' as const },
      { id: 'description', label: 'Description', type: 'textarea' as const }
    ]
  },
  services: {
    title: "Services Section",
    icon: Briefcase,
    description: "Services page content",
    editors: [
      { id: 'title', label: 'Section Title', type: 'text' as const },
      { id: 'description', label: 'Description', type: 'textarea' as const }
    ]
  },
  contact: {
    title: "Contact Section",
    icon: Mail,
    description: "Contact page content",
    editors: [
      { id: 'title', label: 'Section Title', type: 'text' as const },
      { id: 'description', label: 'Description', type: 'textarea' as const }
    ]
  },
  footer: {
    title: "Footer Section",
    icon: Settings,
    description: "Website footer content",
    editors: [
      { id: 'copyright', label: 'Copyright Text', type: 'text' as const },
      { id: 'tagline', label: 'Tagline', type: 'text' as const }
    ]
  }
};

export default function ContentManager() {
  const { allContent, loading, updateContent } = useWebsiteContent();
  const [activeSection, setActiveSection] = useState('hero');
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isPreview, setIsPreview] = useState(false);

  const getContentBySection = (sectionName: string) => {
    return allContent.filter(item => item.section_name === sectionName);
  };

  const getContentValue = (sectionName: string, key: string) => {
    const content = allContent.find(
      item => item.section_name === sectionName && item.content_key === key
    );
    const editKey = `${sectionName}_${key}`;
    return editingValues[editKey] !== undefined ? editingValues[editKey] : (content?.content_value || '');
  };

  const handleInputChange = (sectionName: string, key: string, value: string) => {
    const editKey = `${sectionName}_${key}`;
    setEditingValues(prev => ({
      ...prev,
      [editKey]: value
    }));
  };

  const handleSave = async (sectionName: string, key: string) => {
    const content = allContent.find(
      item => item.section_name === sectionName && item.content_key === key
    );
    
    if (!content) return;

    const editKey = `${sectionName}_${key}`;
    const newValue = editingValues[editKey];
    
    if (newValue !== undefined && newValue !== content.content_value) {
      const success = await updateContent(content.id, newValue);
      if (success) {
        // Clear the editing value after successful save
        setEditingValues(prev => {
          const newValues = { ...prev };
          delete newValues[editKey];
          return newValues;
        });
      }
    }
  };

  const handleSaveAll = async () => {
    const sectionContent = getContentBySection(activeSection);
    const promises = sectionContent.map(content => {
      const editKey = `${activeSection}_${content.content_key}`;
      const newValue = editingValues[editKey];
      
      if (newValue !== undefined && newValue !== content.content_value) {
        return updateContent(content.id, newValue);
      }
      return Promise.resolve(true);
    });

    await Promise.all(promises);
    
    // Clear all editing values for this section
    setEditingValues(prev => {
      const newValues = { ...prev };
      sectionContent.forEach(content => {
        const editKey = `${activeSection}_${content.content_key}`;
        delete newValues[editKey];
      });
      return newValues;
    });
  };

  const resetSection = () => {
    const sectionContent = getContentBySection(activeSection);
    setEditingValues(prev => {
      const newValues = { ...prev };
      sectionContent.forEach(content => {
        const editKey = `${activeSection}_${content.content_key}`;
        delete newValues[editKey];
      });
      return newValues;
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Content Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const currentSection = contentSections[activeSection as keyof typeof contentSections];

  return (
    <AdminLayout title="Universal Content Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Website Content Editor</h2>
            <p className="text-muted-foreground">Manage all website content from one centralized location</p>
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
            <Button 
              variant="outline" 
              onClick={resetSection}
              className="flex items-center gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveAll} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Section Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(contentSections).map(([key, section]) => {
              const Icon = section.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {section.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(contentSections).map(([sectionKey, section]) => (
            <TabsContent key={sectionKey} value={sectionKey}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.editors.map((editor) => (
                    <div key={editor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${sectionKey}_${editor.id}`}>{editor.label}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSave(sectionKey, editor.id)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                      </div>
                      
                      {editor.type === 'textarea' ? (
                        <Textarea
                          id={`${sectionKey}_${editor.id}`}
                          value={getContentValue(sectionKey, editor.id)}
                          onChange={(e) => handleInputChange(sectionKey, editor.id, e.target.value)}
                          placeholder={`Enter ${editor.label.toLowerCase()}`}
                          rows={4}
                        />
                      ) : (
                        <Input
                          id={`${sectionKey}_${editor.id}`}
                          value={getContentValue(sectionKey, editor.id)}
                          onChange={(e) => handleInputChange(sectionKey, editor.id, e.target.value)}
                          placeholder={`Enter ${editor.label.toLowerCase()}`}
                        />
                      )}
                      
                      {editor.description && (
                        <p className="text-xs text-muted-foreground">{editor.description}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Content Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Content Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(contentSections).map(([key, section]) => {
                const sectionContent = getContentBySection(key);
                const hasChanges = sectionContent.some(content => {
                  const editKey = `${key}_${content.content_key}`;
                  return editingValues[editKey] !== undefined;
                });
                
                return (
                  <div key={key} className="text-center">
                    <section.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">{section.title}</p>
                    <Badge variant={hasChanges ? "destructive" : "secondary"} className="text-xs">
                      {hasChanges ? "Unsaved" : "Saved"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}