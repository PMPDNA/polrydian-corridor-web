import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, TrendingUp, Globe, Zap } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export const NewsletterSignup = ({ variant = 'full', className = '' }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const interestOptions = [
    { id: 'corridor_economics', label: 'Corridor Economics', icon: Globe },
    { id: 'geopolitics', label: 'Geopolitical Analysis', icon: TrendingUp },
    { id: 'breaking_news', label: 'Breaking News Alerts', icon: Zap },
    { id: 'monthly_trends', label: 'Monthly Trend Reports', icon: Mail }
  ];

  const handleInterestToggle = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          name: name || null,
          interests,
          source: 'website'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for subscribing to our strategic insights newsletter",
          variant: "default"
        });
        setEmail('');
        setName('');
        setInterests([]);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing you to our newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-accent/5 p-4 rounded-lg border border-accent/20 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Stay Informed</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Get strategic insights and corridor economics analysis delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm"
          />
          <Button type="submit" disabled={loading} size="sm" className="w-full">
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
          
          {isSubscribed && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800 text-sm">Welcome to Strategic Insights!</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                You'll receive curated corridor economics analysis and geopolitical insights every 3 days, 
                plus breaking news alerts when global events impact strategic corridors.
              </p>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-accent" />
          Strategic Insights Newsletter
        </CardTitle>
        <CardDescription>
          Stay ahead with curated analysis on corridor economics, geopolitical trends, and strategic opportunities. 
          Delivered every 3 days with breaking news alerts when global events impact strategic corridors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Interests (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interestOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={interests.includes(option.id)}
                      onCheckedChange={() => handleInterestToggle(option.id)}
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-accent" />
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Subscribing...' : 'Subscribe to Strategic Insights'}
          </Button>

          {isSubscribed && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Welcome to Strategic Insights!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Thank you for subscribing! You'll receive curated corridor economics analysis and geopolitical insights 
                every 3 days, plus breaking news alerts when global events impact strategic corridors.
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe at any time. No spam, just valuable strategic insights.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};