import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Shield, Plus, X } from 'lucide-react'

interface AdminConfig {
  id: string
  setting_name: string
  setting_value: any
  created_at: string
  updated_at: string
}

export default function AdminConfigManager() {
  const { isAdmin } = useSupabaseAuth()
  const [adminEmails, setAdminEmails] = useState<AdminConfig | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetchAdminConfig()
    }
  }, [isAdmin])

  const fetchAdminConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_configuration')
        .select('*')
        .eq('setting_name', 'admin_emails')
        .single()

      if (error) throw error
      setAdminEmails({
        ...data,
        setting_value: Array.isArray(data.setting_value) ? data.setting_value : JSON.parse(data.setting_value as string)
      })
    } catch (error: any) {
      console.error('Error fetching admin config:', error)
      toast.error('Failed to load admin configuration')
    } finally {
      setLoading(false)
    }
  }

  const updateAdminEmails = async (emails: string[]) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('admin_configuration')
        .update({ 
          setting_value: emails,
          updated_at: new Date().toISOString()
        })
        .eq('setting_name', 'admin_emails')

      if (error) throw error
      
      await fetchAdminConfig()
      toast.success('Admin emails updated successfully')
    } catch (error: any) {
      console.error('Error updating admin emails:', error)
      toast.error('Failed to update admin emails')
    } finally {
      setSaving(false)
    }
  }

  const addEmail = () => {
    if (!newEmail || !adminEmails) return
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    const currentEmails = adminEmails.setting_value
    if (currentEmails.includes(newEmail)) {
      toast.error('Email already exists in admin list')
      return
    }

    const updatedEmails = [...currentEmails, newEmail]
    updateAdminEmails(updatedEmails)
    setNewEmail('')
  }

  const removeEmail = (emailToRemove: string) => {
    if (!adminEmails) return
    
    const currentEmails = adminEmails.setting_value
    if (currentEmails.length <= 1) {
      toast.error('Cannot remove the last admin email')
      return
    }

    const updatedEmails = currentEmails.filter(email => email !== emailToRemove)
    updateAdminEmails(updatedEmails)
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Admin access required to manage configuration</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading configuration...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Configuration
        </CardTitle>
        <CardDescription>
          Manage admin email addresses for automatic role assignment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Current Admin Emails</h3>
          <div className="space-y-2">
            {adminEmails?.setting_value.map((email) => (
              <div key={email} className="flex items-center justify-between p-2 border rounded-lg">
                <Badge variant="secondary" className="font-mono text-xs">
                  {email}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmail(email)}
                  disabled={saving || adminEmails.setting_value.length <= 1}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Add New Admin Email</h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="admin@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addEmail()
                }
              }}
            />
            <Button onClick={addEmail} disabled={saving || !newEmail}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Users with these email addresses will automatically receive admin roles when they sign up
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Last updated: {adminEmails ? new Date(adminEmails.updated_at).toLocaleString() : 'Never'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}