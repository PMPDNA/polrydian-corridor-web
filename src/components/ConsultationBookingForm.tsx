import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Building2, 
  Phone,
  MessageSquare,
  Send,
  AlertTriangle
} from "lucide-react";

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  serviceArea: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  urgencyLevel: string;
}

export const ConsultationBookingForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    serviceArea: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    urgencyLevel: "standard"
  });

  const serviceAreas = [
    "Corridor Economics Advisory",
    "Infrastructure & M&A",
    "Food Security & Agritech",
    "Aviation & Logistics",
    "Geopolitical Strategy",
    "Economic Development",
    "Other (Please specify in message)"
  ];

  const timeSlots = [
    "Morning (9:00 - 12:00)",
    "Afternoon (12:00 - 17:00)",
    "Evening (17:00 - 20:00)",
    "Flexible"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use secure contact form endpoint with validation
      const response = await supabase.functions.invoke('secure-contact-form', {
        body: {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company?.trim() || null,
          phone: formData.phone?.trim() || null,
          service_area: formData.serviceArea || null,
          message: formData.message.trim(),
          urgency_level: formData.urgencyLevel
        }
      });

      if (response.error) {
        console.error('Submission error:', response.error);
        throw new Error('Network error occurred');
      }

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || 'Submission failed');
      }

      toast({
        title: "Consultation Request Submitted!",
        description: "Thank you for your interest. Patrick will review your request and respond within 24-48 hours.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        phone: "",
        serviceArea: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
        urgencyLevel: "standard"
      });

    } catch (error: any) {
      console.error('Secure booking form error:', error);
      toast({
        title: "Error Submitting Request",
        description: error.message?.includes('Rate limit') 
          ? "Too many requests. Please try again later."
          : "There was an issue submitting your consultation request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-elegant max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-accent" />
          Schedule Strategic Consultation
        </CardTitle>
        <p className="text-muted-foreground">
          Let's discuss how corridor economics can transform your strategic challenges into competitive advantages.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                First Name *
              </Label>
              <Input 
                id="firstName" 
                name="firstName"
                placeholder="Your first name" 
                className="mt-1" 
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName" 
                name="lastName"
                placeholder="Your last name" 
                className="mt-1" 
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="your.email@company.com" 
              className="mt-1" 
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </Label>
              <Input 
                id="company" 
                name="company"
                placeholder="Your company or organization" 
                className="mt-1" 
                value={formData.company}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input 
                id="phone" 
                name="phone"
                placeholder="+1 (555) 123-4567" 
                className="mt-1" 
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="serviceArea">Area of Interest</Label>
            <select 
              id="serviceArea" 
              name="serviceArea"
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              value={formData.serviceArea}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">Select a service area</option>
              {serviceAreas.map((service, index) => (
                <option key={index} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preferred Date
              </Label>
              <Input 
                id="preferredDate" 
                name="preferredDate"
                type="date" 
                className="mt-1" 
                value={formData.preferredDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="preferredTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Time
              </Label>
              <select 
                id="preferredTime" 
                name="preferredTime"
                className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                value={formData.preferredTime}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="">Select preferred time</option>
                {timeSlots.map((slot, index) => (
                  <option key={index} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Strategic Challenge or Opportunity *
            </Label>
            <Textarea 
              id="message" 
              name="message"
              placeholder="Describe your strategic challenge, project scope, or opportunity. The more detail you provide, the better we can tailor our initial consultation." 
              className="mt-1 min-h-[120px]"
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="urgencyLevel" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Priority Level
            </Label>
            <select 
              id="urgencyLevel" 
              name="urgencyLevel"
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              value={formData.urgencyLevel}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="standard">Standard (48-hour response)</option>
              <option value="high">High Priority (24-hour response)</option>
              <option value="urgent">Urgent (Same-day response)</option>
            </select>
          </div>

          <Button 
            type="submit" 
            variant="default" 
            size="lg" 
            className="w-full text-lg py-6" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Request Strategic Consultation
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting this form, you agree to our confidentiality protocols and professional consultation terms.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};