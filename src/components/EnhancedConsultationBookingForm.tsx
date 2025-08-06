import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, Mail, Building, Phone, MessageSquare, Clock } from 'lucide-react';

export function EnhancedConsultationBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    phone: '',
    service_area: '',
    preferred_date: '',
    preferred_time: '',
    urgency_level: 'standard',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .insert([{
          ...formData,
          preferred_date: formData.preferred_date ? new Date(formData.preferred_date).toISOString() : null
        }]);

      if (error) throw error;

      toast({
        title: "Consultation Request Submitted",
        description: "Thank you for your interest. We'll respond within 24 hours to confirm your consultation.",
      });

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        phone: '',
        service_area: '',
        preferred_date: '',
        preferred_time: '',
        urgency_level: 'standard',
        message: ''
      });

    } catch (error: any) {
      console.error('Error submitting consultation request:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elegant">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6 text-accent" />
          Request Strategic Consultation
        </CardTitle>
        <CardDescription>
          Complete this form to schedule your consultation. We'll contact you within 24 hours to confirm details.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                First Name
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company/Organization
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>

          {/* Service Area */}
          <div className="space-y-2">
            <Label htmlFor="service_area">Primary Area of Interest</Label>
            <select
              id="service_area"
              value={formData.service_area}
              onChange={(e) => handleChange('service_area', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="">Select an area</option>
              <option value="corridor-economics">Corridor Economics Strategy</option>
              <option value="geopolitical-analysis">Geopolitical Risk Analysis</option>
              <option value="strategic-planning">Strategic Planning</option>
              <option value="market-entry">Market Entry Strategy</option>
              <option value="supply-chain">Supply Chain Optimization</option>
              <option value="investment-analysis">Investment Analysis</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Scheduling Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferred_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preferred Date
              </Label>
              <Input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => handleChange('preferred_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Time
              </Label>
              <select
                id="preferred_time"
                value={formData.preferred_time}
                onChange={(e) => handleChange('preferred_time', e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="">Select time</option>
                <option value="morning">Morning (9AM - 12PM EST)</option>
                <option value="afternoon">Afternoon (12PM - 5PM EST)</option>
                <option value="evening">Evening (5PM - 8PM EST)</option>
              </select>
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label htmlFor="urgency_level">Timeline</Label>
            <select
              id="urgency_level"
              value={formData.urgency_level}
              onChange={(e) => handleChange('urgency_level', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="standard">Standard (within 1 week)</option>
              <option value="urgent">Urgent (within 2-3 days)</option>
              <option value="immediate">Immediate (within 24 hours)</option>
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your strategic challenges, goals, or any specific topics you'd like to discuss..."
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Consultation Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}