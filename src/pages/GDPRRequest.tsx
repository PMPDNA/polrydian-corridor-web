import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Download, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Navigation } from '@/components/Navigation'
import Footer from '@/components/Footer'

interface RequestFormData {
  email: string
  requestType: 'deletion' | 'export' | 'rectification'
  reason: string
  requestedData: string[]
}

export default function GDPRRequest() {
  const [formData, setFormData] = useState<RequestFormData>({
    email: '',
    requestType: 'export',
    reason: '',
    requestedData: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    requestId?: string
  }>({ type: null, message: '' })

  const dataTypes = [
    { id: 'analytics', label: 'Website Analytics Data', description: 'Page visits, device info, browsing patterns' },
    { id: 'personal', label: 'Personal Information', description: 'Profile data, contact information' },
    { id: 'consent', label: 'Consent Records', description: 'Cookie preferences, privacy settings' },
    { id: 'communication', label: 'Communication Data', description: 'Contact form submissions, support tickets' }
  ]

  const handleDataTypeChange = (dataTypeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requestedData: checked 
        ? [...prev.requestedData, dataTypeId]
        : prev.requestedData.filter(id => id !== dataTypeId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const visitorId = localStorage.getItem('visitor_id')
      
      const { data, error } = await supabase.functions.invoke('gdpr-data-request', {
        body: {
          email: formData.email,
          visitor_id: visitorId,
          request_type: formData.requestType,
          reason: formData.reason,
          requested_data: formData.requestedData.length > 0 ? formData.requestedData : undefined
        }
      })

      if (error) throw error

      if (formData.requestType === 'export' && data.data) {
        // Trigger download for data export
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gdpr-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setSubmitStatus({
          type: 'success',
          message: 'Your data has been exported and downloaded successfully.',
          requestId: data.request_id
        })
      } else {
        setSubmitStatus({
          type: 'success',
          message: `Your ${formData.requestType} request has been submitted successfully. We will process it within 30 days.`,
          requestId: data.request_id
        })
      }

      // Reset form
      setFormData({
        email: '',
        requestType: 'export',
        reason: '',
        requestedData: []
      })

    } catch (error) {
      console.error('GDPR request error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit your request. Please try again or contact our support team.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'export': return Download
      case 'deletion': return Trash2
      case 'rectification': return Edit
      default: return Shield
    }
  }

  const getRequestDescription = (type: string) => {
    switch (type) {
      case 'export': 
        return 'Download a copy of all personal data we have about you in a machine-readable format.'
      case 'deletion': 
        return 'Request permanent deletion of your personal data from our systems (subject to legal retention requirements).'
      case 'rectification': 
        return 'Request correction or update of inaccurate or incomplete personal data.'
      default: 
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold text-foreground">GDPR Data Request</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Exercise your data protection rights. Request access, correction, or deletion of your personal data.
            </p>
          </div>

          {/* Status Alert */}
          {submitStatus.type && (
            <Alert className={`mb-6 ${submitStatus.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {submitStatus.message}
                {submitStatus.requestId && (
                  <div className="mt-2 text-sm">
                    <strong>Request ID:</strong> {submitStatus.requestId}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Submit Your Request</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below to exercise your GDPR rights. All requests are processed within 30 days.
                  </p>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll use this email to verify your identity and send updates about your request.
                      </p>
                    </div>

                    {/* Request Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Request Type *
                      </label>
                      <Select 
                        value={formData.requestType} 
                        onValueChange={(value: 'deletion' | 'export' | 'rectification') => 
                          setFormData(prev => ({ ...prev, requestType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="export">
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              Data Export (Right to Access)
                            </div>
                          </SelectItem>
                          <SelectItem value="deletion">
                            <div className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              Data Deletion (Right to be Forgotten)
                            </div>
                          </SelectItem>
                          <SelectItem value="rectification">
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Data Rectification (Right to Correction)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {getRequestDescription(formData.requestType)}
                      </p>
                    </div>

                    {/* Data Types (for export/deletion) */}
                    {(formData.requestType === 'export' || formData.requestType === 'deletion') && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Data Categories {formData.requestType === 'export' ? '(Optional)' : '*'}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {formData.requestType === 'export' 
                            ? 'Leave empty to export all available data, or select specific categories:'
                            : 'Select the categories of data you want deleted:'
                          }
                        </p>
                        <div className="space-y-3">
                          {dataTypes.map((dataType) => (
                            <div key={dataType.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={dataType.id}
                                checked={formData.requestedData.includes(dataType.id)}
                                onCheckedChange={(checked) => 
                                  handleDataTypeChange(dataType.id, checked as boolean)
                                }
                              />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={dataType.id}
                                  className="text-sm font-medium text-foreground cursor-pointer"
                                >
                                  {dataType.label}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {dataType.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Reason for Request {formData.requestType === 'rectification' ? '*' : '(Optional)'}
                      </label>
                      <Textarea
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder={
                          formData.requestType === 'rectification' 
                            ? 'Please describe what information needs to be corrected and provide the accurate information...'
                            : 'Please provide any additional context for your request...'
                        }
                        rows={4}
                        required={formData.requestType === 'rectification'}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        'Submitting Request...'
                      ) : (
                        <>
                          {React.createElement(getRequestIcon(formData.requestType), { className: 'h-4 w-4 mr-2' })}
                          Submit {formData.requestType === 'export' ? 'Export' : formData.requestType === 'deletion' ? 'Deletion' : 'Rectification'} Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Information Sidebar */}
            <div className="space-y-6">
              {/* Your Rights */}
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Your Data Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Download className="h-4 w-4 text-accent mt-1" />
                      <div>
                        <p className="font-medium text-foreground">Right to Access</p>
                        <p className="text-sm text-muted-foreground">Get a copy of your personal data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Edit className="h-4 w-4 text-accent mt-1" />
                      <div>
                        <p className="font-medium text-foreground">Right to Rectification</p>
                        <p className="text-sm text-muted-foreground">Correct inaccurate information</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Trash2 className="h-4 w-4 text-accent mt-1" />
                      <div>
                        <p className="font-medium text-foreground">Right to Erasure</p>
                        <p className="text-sm text-muted-foreground">Request deletion of your data</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Processing Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Export</span>
                      <span className="text-sm font-medium">Immediate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Rectification</span>
                      <span className="text-sm font-medium">3-5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Deletion</span>
                      <span className="text-sm font-medium">Up to 30 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you have questions about your data rights or need assistance with your request:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> privacy@polrydian.com</p>
                    <p><strong>Response Time:</strong> Within 48 hours</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}