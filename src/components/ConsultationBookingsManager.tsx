import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Building2, 
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface ConsultationBooking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone: string;
  service_area: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  urgency_level: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export const ConsultationBookingsManager = () => {
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ConsultationBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch consultation bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ 
          status,
          admin_notes: notes || adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Booking status changed to ${status}`,
      });

      fetchBookings();
      setSelectedBooking(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'standard': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consultation Bookings</h2>
          <p className="text-muted-foreground">
            Manage incoming consultation requests and bookings
          </p>
        </div>
        <Button onClick={fetchBookings} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Consultation Requests</h3>
              <p className="text-muted-foreground">
                New consultation requests will appear here when submitted.
              </p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {booking.first_name} {booking.last_name}
                      {booking.company && (
                        <span className="text-sm text-muted-foreground">
                          @ {booking.company}
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Badge className={getUrgencyColor(booking.urgency_level)}>
                        {booking.urgency_level} priority
                      </Badge>
                      {booking.service_area && (
                        <Badge variant="outline">
                          {booking.service_area}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Submitted: {new Date(booking.created_at).toLocaleDateString()}</p>
                    {booking.updated_at !== booking.created_at && (
                      <p>Updated: {new Date(booking.updated_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.email}</span>
                    </div>
                    {booking.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {booking.preferred_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(booking.preferred_date).toLocaleDateString()}
                          {booking.preferred_time && ` - ${booking.preferred_time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {booking.message && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="font-medium text-sm">Message:</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {booking.message}
                    </p>
                  </div>
                )}

                {booking.admin_notes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="font-medium text-sm text-blue-800">Admin Notes:</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {booking.admin_notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    onClick={() => setSelectedBooking(booking)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        variant="default"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <Button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      variant="default"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Management Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                Manage Booking: {selectedBooking.first_name} {selectedBooking.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <Textarea
                  value={adminNotes || selectedBooking.admin_notes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'pending')}
                  variant="outline"
                  size="sm"
                >
                  Set Pending
                </Button>
                <Button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                  variant="default"
                  size="sm"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                  variant="default"
                  size="sm"
                >
                  Complete
                </Button>
                <Button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                  variant="destructive"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setSelectedBooking(null);
                    setAdminNotes('');
                  }}
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={() => updateBookingStatus(selectedBooking.id, selectedBooking.status)}
                  variant="default"
                >
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};