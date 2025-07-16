import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/FileUpload";
import { CalendlyIntegration } from "@/components/CalendlyIntegration";
import { 
  User, 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  Camera,
  Upload,
  ExternalLink,
  Eye,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  photo: string;
  name: string;
  title: string;
  bio: string;
  calendlyUsername: string;
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
    size: number;
  }[];
}

export default function ProfileManager() {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({
    photo: "",
    name: "Patrick Oscar Misiewicz",
    title: "Founder & Strategic Advisor, Polrydian Group",
    bio: "Transforming complexity and geopolitical friction into clear, actionable strategy through corridor economics and disciplined strategic thinking.",
    calendlyUsername: "",
    documents: []
  });

  const [showCalendlySetup, setShowCalendlySetup] = useState(false);

  const handlePhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfileData(prev => ({ ...prev, photo: urls[0] }));
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been successfully uploaded.",
      });
    }
  };

  const handleDocumentUpload = (files: File[]) => {
    const newDocs = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString(),
      size: file.size
    }));

    setProfileData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs]
    }));

    toast({
      title: "Documents uploaded",
      description: `${newDocs.length} document(s) uploaded successfully.`,
    });
  };

  const removeDocument = (docId: string) => {
    setProfileData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
    toast({
      title: "Document removed",
      description: "Document has been removed from your profile.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📋';
    if (type.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information, documents, and integrations
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your profile photo and basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="space-y-4">
            <Label>Profile Photo</Label>
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
                  {profileData.photo ? (
                    <img 
                      src={profileData.photo} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">No photo</span>
                    </div>
                  )}
                </div>
                {profileData.photo && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setProfileData(prev => ({ ...prev, photo: "" }))}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <FileUpload
                  onFilesChange={handlePhotoUpload}
                  currentFiles={profileData.photo ? [profileData.photo] : []}
                  multiple={false}
                  accept="image/*"
                  label="Upload Profile Photo"
                  maxSize={5}
                />
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={profileData.title}
                onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
          </CardTitle>
          <CardDescription>
            Upload and manage your professional documents, presentations, and resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            onFilesChange={(urls) => {
              // This is a simplified version - in a real app you'd handle file objects
              console.log("Document URLs:", urls);
            }}
            currentFiles={[]}
            multiple={true}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            label="Upload Documents"
            maxSize={25}
          />

          {/* Document List */}
          {profileData.documents.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Uploaded Documents</h4>
              <div className="space-y-3">
                {profileData.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileTypeIcon(doc.type)}</span>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.url} download={doc.name}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendly Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meeting Scheduling
          </CardTitle>
          <CardDescription>
            Connect Calendly for seamless meeting scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calendlyUsername">Calendly Username</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex">
                  <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l-md">
                    calendly.com/
                  </span>
                  <Input
                    id="calendlyUsername"
                    value={profileData.calendlyUsername}
                    onChange={(e) => setProfileData(prev => ({ ...prev, calendlyUsername: e.target.value }))}
                    placeholder="your-username"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <Dialog open={showCalendlySetup} onOpenChange={setShowCalendlySetup}>
                <DialogTrigger asChild>
                  <Button className="gap-2 h-10">
                    <Settings className="h-4 w-4" />
                    Advanced Setup
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <CalendlyIntegration />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {profileData.calendlyUsername && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Quick Link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background p-2 rounded border">
                  https://calendly.com/{profileData.calendlyUsername}
                </code>
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`https://calendly.com/${profileData.calendlyUsername}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            toast({
              title: "Profile updated",
              description: "Your profile changes have been saved successfully.",
            });
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
    </div>
  );
}