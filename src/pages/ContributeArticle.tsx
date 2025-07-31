import { ArticleSubmissionForm } from '@/components/ArticleSubmissionForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Users, Lightbulb, FileText } from 'lucide-react'

export default function ContributeArticle() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contribute Your Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Share your perspectives on current economic realities, market analysis, and strategic insights. 
            Join our community of thought leaders and contribute to meaningful discussions.
          </p>
        </div>

        {/* Process Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>1. Submit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Share your article draft using our submission form. Include your insights, analysis, and supporting information.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>2. Review</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Our editorial team reviews submissions for quality, relevance, and alignment with our content standards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>3. Publish</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Approved articles are published on our platform and shared with our community of readers and thought leaders.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines Section */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Submission Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Content Requirements</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Minimum 500 words</li>
                    <li>• Original content only</li>
                    <li>• Focus on economic insights, market analysis, or strategic perspectives</li>
                    <li>• Include supporting data or sources when applicable</li>
                    <li>• Professional tone and clear structure</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">What We Look For</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Unique perspectives on current market conditions</li>
                    <li>• Data-driven analysis and insights</li>
                    <li>• Actionable recommendations for readers</li>
                    <li>• Thought-provoking discussions on economic trends</li>
                    <li>• Clear writing style and logical flow</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission Form */}
        <ArticleSubmissionForm />
      </div>
    </div>
  )
}