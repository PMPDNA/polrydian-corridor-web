import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { X, Shield, Eye, BarChart3, Target, ExternalLink } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

interface ConsentManagerProps {
  onAcceptAll?: () => void
  onRejectAll?: () => void
  onSavePreferences?: (preferences: ConsentPreferences) => void
  onClose?: () => void
  mode?: 'banner' | 'settings'
}

export const GDPRConsentManager = ({ 
  onAcceptAll, 
  onRejectAll, 
  onSavePreferences, 
  onClose,
  mode = 'banner' 
}: ConsentManagerProps) => {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  })
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(mode === 'settings')

  // Generate or get visitor ID
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('visitor_id', visitorId)
    }
    return visitorId
  }

  // Generate session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  useEffect(() => {
    // Check if consent has already been given
    const consentStatus = localStorage.getItem('gdpr_consent_status')
    if (!consentStatus && mode === 'banner') {
      setIsVisible(true)
    }

    // Load existing preferences
    const savedPreferences = localStorage.getItem('gdpr_preferences')
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }

    // Track page visit if analytics consent given
    const currentPrefs = savedPreferences ? JSON.parse(savedPreferences) : preferences
    if (currentPrefs.analytics) {
      trackPageVisit()
    }
  }, [])

  const trackPageVisit = async () => {
    try {
      const visitorData = {
        visitor_id: getVisitorId(),
        page_url: window.location.href,
        referrer: document.referrer,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      await supabase.functions.invoke('track-visitor', {
        body: {
          action: 'track_visitor',
          data: visitorData
        }
      })
    } catch (error) {
      console.error('Visitor tracking error:', error)
    }
  }

  const updateConsent = async (consentType: string, consentGiven: boolean, purpose: string) => {
    try {
      await supabase.functions.invoke('track-visitor', {
        body: {
          action: 'update_consent',
          data: {
            visitor_id: getVisitorId(),
            consent_type: consentType,
            consent_given: consentGiven,
            purpose: purpose
          }
        }
      })
    } catch (error) {
      console.error('Consent update error:', error)
    }
  }

  const handleAcceptAll = async () => {
    const newPreferences = { necessary: true, analytics: true, marketing: true }
    setPreferences(newPreferences)
    
    // Update consent records
    await updateConsent('analytics', true, 'Website analytics and performance monitoring')
    await updateConsent('marketing', true, 'Personalized marketing and advertising')
    
    // Save to localStorage
    localStorage.setItem('gdpr_consent_status', 'accepted_all')
    localStorage.setItem('gdpr_preferences', JSON.stringify(newPreferences))
    
    setIsVisible(false)
    onAcceptAll?.()
    
    // Start tracking
    trackPageVisit()
  }

  const handleRejectAll = async () => {
    const newPreferences = { necessary: true, analytics: false, marketing: false }
    setPreferences(newPreferences)
    
    // Update consent records
    await updateConsent('analytics', false, 'Website analytics and performance monitoring')
    await updateConsent('marketing', false, 'Personalized marketing and advertising')
    
    // Save to localStorage
    localStorage.setItem('gdpr_consent_status', 'rejected_optional')
    localStorage.setItem('gdpr_preferences', JSON.stringify(newPreferences))
    
    setIsVisible(false)
    onRejectAll?.()
  }

  const handleSavePreferences = async () => {
    // Update consent records
    await updateConsent('analytics', preferences.analytics, 'Website analytics and performance monitoring')
    await updateConsent('marketing', preferences.marketing, 'Personalized marketing and advertising')
    
    // Save to localStorage
    localStorage.setItem('gdpr_consent_status', 'custom')
    localStorage.setItem('gdpr_preferences', JSON.stringify(preferences))
    
    setIsVisible(false)
    onSavePreferences?.(preferences)
    
    // Start tracking if analytics enabled
    if (preferences.analytics) {
      trackPageVisit()
    }
  }

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === 'necessary') return // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!isVisible && mode === 'banner') return null

  const consentTypes = [
    {
      key: 'necessary' as keyof ConsentPreferences,
      title: 'Necessary Cookies',
      description: 'Essential for website functionality, security, and navigation. These cannot be disabled.',
      examples: 'Session management, security tokens, accessibility settings',
      icon: Shield,
      disabled: true
    },
    {
      key: 'analytics' as keyof ConsentPreferences,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      examples: 'Page views, user journeys, performance metrics',
      icon: BarChart3,
      disabled: false
    },
    {
      key: 'marketing' as keyof ConsentPreferences,
      title: 'Marketing Cookies',
      description: 'Used to show relevant, personalized advertisements.',
      examples: 'Ad targeting, social media integration, conversion tracking',
      icon: Target,
      disabled: false
    }
  ]

  if (mode === 'settings') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Privacy Settings</h2>
          <p className="text-muted-foreground">
            Manage your data privacy preferences and control how we collect and use your information.
          </p>
        </div>

        <div className="space-y-4">
          {consentTypes.map(({ key, title, description, examples, icon: Icon, disabled }) => (
            <Card key={key} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 text-accent mt-1" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Examples:</span> {examples}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[key]}
                    onCheckedChange={(checked) => updatePreference(key, checked)}
                    disabled={disabled}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSavePreferences} className="flex-1">
            Save Preferences
          </Button>
          <Button onClick={handleAcceptAll} variant="outline">
            Accept All
          </Button>
        </div>

        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-accent mt-1" />
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Your Data Rights</h4>
                <p className="text-sm text-muted-foreground">
                  You have the right to access, rectify, or delete your personal data. 
                  You can also withdraw consent at any time.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/privacy#data-rights', '_blank')}
                  >
                    Learn More <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/gdpr-request', '_blank')}
                  >
                    Request Data <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border shadow-2xl">
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-accent" />
                Your Privacy Matters
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                We use cookies and similar technologies to enhance your experience and understand how you use our website.
              </p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showDetails && (
            <div className="space-y-4">
              {consentTypes.map(({ key, title, description, examples, icon: Icon, disabled }) => (
                <div key={key} className="flex items-start justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 text-accent mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">{title}</h4>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Examples:</span> {examples}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[key]}
                    onCheckedChange={(checked) => updatePreference(key, checked)}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAcceptAll} className="flex-1">
              Accept All Cookies
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
              Reject Optional
            </Button>
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="ghost"
              className="flex-1"
            >
              {showDetails ? 'Hide Details' : 'Customize'}
            </Button>
          </div>

          {showDetails && (
            <Button onClick={handleSavePreferences} className="w-full">
              Save My Preferences
            </Button>
          )}

          <div className="text-xs text-muted-foreground text-center">
            By clicking "Accept All", you consent to our use of cookies. 
            Read our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a> and{' '}
            <a href="/cookie-settings" className="text-accent hover:underline">Cookie Policy</a> for more information.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}