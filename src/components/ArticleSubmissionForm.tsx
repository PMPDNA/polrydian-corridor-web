import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Send } from 'lucide-react'

const submissionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  content: z.string().min(500, 'Content must be at least 500 characters'),
  meta_description: z.string().max(160, 'Meta description should be under 160 characters').optional(),
  keywords: z.string().optional(),
  submitter_name: z.string().min(2, 'Name is required'),
  submitter_email: z.string().email('Valid email is required'),
  submitter_message: z.string().optional(),
})

type SubmissionForm = z.infer<typeof submissionSchema>

interface ArticleSubmissionFormProps {
  onSuccess?: () => void
}

export function ArticleSubmissionForm({ onSuccess }: ArticleSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: '',
      content: '',
      meta_description: '',
      keywords: '',
      submitter_name: '',
      submitter_email: '',
      submitter_message: '',
    },
  })

  const onSubmit = async (values: SubmissionForm) => {
    setIsSubmitting(true)

    try {
      const keywords = values.keywords 
        ? values.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : []

      const { error } = await supabase
        .from('article_submissions')
        .insert({
          title: values.title,
          content: values.content,
          meta_description: values.meta_description || null,
          keywords: keywords.length > 0 ? keywords : null,
          submitter_name: values.submitter_name,
          submitter_email: values.submitter_email,
          submitter_message: values.submitter_message || null,
        })

      if (error) throw error

      toast({
        title: "Submission Successful!",
        description: "Thank you for your contribution. We'll review your article and get back to you soon.",
      })

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error submitting article:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Submit Your Article
        </CardTitle>
        <CardDescription>
          Share your insights and perspectives with our community. All submissions are reviewed before publication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="submitter_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="submitter_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your compelling article title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A brief description of your article for search engines..."
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="economics, market analysis, finance (comma-separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your article content here. Please include your insights, analysis, and any supporting information..."
                      className="min-h-[300px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="submitter_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional context or message for our editorial team..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Article
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}