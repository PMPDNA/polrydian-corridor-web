import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Mail,
  Calendar
} from "lucide-react";

export default function Privacy() {
  const lastUpdated = "December 16, 2024";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Privacy Policy & Terms
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your privacy and trust are fundamental to our professional relationship. 
            This policy outlines how we protect and handle your information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Privacy Policy */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-3">
              <Shield className="h-6 w-6 text-accent" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Information We Collect</h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Contact Information:</strong> Name, email address, phone number, company details, and job title when you contact us or schedule consultations.</p>
                <p><strong>Strategic Information:</strong> Business challenges, strategic objectives, and organizational details shared during consultations.</p>
                <p><strong>Communication Records:</strong> Records of our interactions, consultation notes, and strategic recommendations.</p>
                <p><strong>Website Usage:</strong> Basic analytics data to improve our website experience and service delivery.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">How We Use Your Information</h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Strategic Consultation:</strong> To provide corridor economics consulting and strategic advisory services.</p>
                <p><strong>Communication:</strong> To respond to inquiries, schedule consultations, and provide ongoing support.</p>
                <p><strong>Service Improvement:</strong> To enhance our methodology and service delivery.</p>
                <p><strong>Professional Development:</strong> To develop case studies and insights (always with anonymized data).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Information Protection</h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Professional Privilege:</strong> All strategic discussions are protected under professional advisory privilege.</p>
                <p><strong>Encryption:</strong> All data transmission and storage uses industry-standard encryption protocols.</p>
                <p><strong>Access Control:</strong> Strict access controls ensure only authorized personnel can access your information.</p>
                <p><strong>Confidentiality Agreements:</strong> All team members and partners sign comprehensive confidentiality agreements.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Information Sharing</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>We do not sell, trade, or share your personal or strategic information with third parties, except:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>With your explicit written consent</li>
                  <li>When required by law or legal process</li>
                  <li>With trusted partners bound by confidentiality agreements (only when necessary for service delivery)</li>
                  <li>In anonymized form for research and methodology development</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Your Rights</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access your personal information we hold</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information (subject to legal and professional obligations)</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data in portable format</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-3">
              <FileText className="h-6 w-6 text-accent" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Professional Services</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Polrydian provides strategic consulting services specializing in corridor economics methodology. Our services include strategic consultation, risk assessment, market analysis, and implementation guidance.</p>
                <p>All services are provided on a professional consulting basis. We are not providing legal, accounting, or investment advice unless specifically engaged for such services and properly licensed.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Client Responsibilities</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Clients are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Providing accurate and complete information necessary for strategic analysis</li>
                  <li>Implementing recommendations at their own discretion and risk</li>
                  <li>Maintaining confidentiality of our proprietary methodologies</li>
                  <li>Timely payment of agreed fees and expenses</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Intellectual Property</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>The corridor economics methodology, strategic frameworks, and analysis techniques remain the intellectual property of Polrydian. Clients receive a license to use recommendations for their internal business purposes.</p>
                <p>Client-specific strategic insights and recommendations become the property of the client upon full payment of fees.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Limitation of Liability</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Our liability is limited to the fees paid for the specific engagement. We provide strategic guidance based on information available at the time of analysis. Market conditions, regulatory changes, and other factors may affect outcomes.</p>
                <p>Clients acknowledge that strategic decisions carry inherent risks and that implementation of recommendations is at their own discretion and risk.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Termination</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Either party may terminate an engagement with written notice. Confidentiality obligations survive termination indefinitely. Clients remain responsible for fees incurred prior to termination.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-3">
              <Eye className="h-6 w-6 text-accent" />
              Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-muted-foreground">
              <p>We use essential cookies to ensure our website functions properly and analytics cookies to understand how visitors interact with our site. We do not use tracking cookies for advertising purposes.</p>
              <p>You can control cookie settings through your browser preferences. Disabling essential cookies may affect website functionality.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Questions About This Policy?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                If you have questions about our privacy practices or terms of service, 
                please contact us directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-accent" />
                  <span>info@polrydian.com</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>+1 305 878 6400</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}