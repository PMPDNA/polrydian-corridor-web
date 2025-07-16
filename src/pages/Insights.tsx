import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Globe, 
  Target,
  ArrowRight,
  BookOpen,
  Filter
} from "lucide-react";

export default function Insights() {
  const featuredArticle = {
    title: "The Corridor Economics Revolution: Why Traditional Strategy is Failing",
    excerpt: "In an interconnected world, isolated solutions create isolated problems. Discover how corridor economics transforms strategic thinking by revealing the pathways that connect challenges to opportunities.",
    category: "Strategic Thinking",
    readTime: "8 min read",
    publishDate: "December 15, 2024",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=400&fit=crop"
  };

  const articles = [
    {
      title: "Mapping Strategic Corridors: A Practical Framework",
      excerpt: "Learn the step-by-step methodology for identifying and building strategic corridors that transform obstacles into competitive advantages.",
      category: "Methodology",
      readTime: "6 min read",
      publishDate: "December 10, 2024",
      tags: ["Framework", "Strategy", "Implementation"]
    },
    {
      title: "Geopolitical Risk in the Corridor Economy",
      excerpt: "How corridor economics helps organizations navigate political uncertainty and turn geopolitical challenges into strategic opportunities.",
      category: "Risk Management",
      readTime: "7 min read",
      publishDate: "December 5, 2024",
      tags: ["Geopolitics", "Risk", "Global Strategy"]
    },
    {
      title: "Supply Chain Resilience Through Strategic Corridors",
      excerpt: "Case study: How a Fortune 500 company used corridor economics to build a supply chain that thrives on disruption.",
      category: "Case Study",
      readTime: "5 min read",
      publishDate: "November 28, 2024",
      tags: ["Supply Chain", "Resilience", "Case Study"]
    },
    {
      title: "The Network Effect of Strategic Decision Making",
      excerpt: "Why every strategic decision creates ripple effects—and how corridor economics helps you navigate them intentionally.",
      category: "Strategic Thinking",
      readTime: "9 min read",
      publishDate: "November 20, 2024",
      tags: ["Decision Making", "Networks", "Strategy"]
    },
    {
      title: "M&A Integration: Building Bridges, Not Walls",
      excerpt: "How corridor economics transforms M&A integration from a compliance exercise into a value creation opportunity.",
      category: "M&A",
      readTime: "8 min read",
      publishDate: "November 15, 2024",
      tags: ["M&A", "Integration", "Value Creation"]
    },
    {
      title: "Digital Transformation as Corridor Building",
      excerpt: "Reframe digital transformation from technology implementation to strategic corridor development for lasting competitive advantage.",
      category: "Digital Strategy",
      readTime: "6 min read",
      publishDate: "November 8, 2024",
      tags: ["Digital", "Transformation", "Technology"]
    }
  ];

  const categories = [
    "All Articles",
    "Strategic Thinking",
    "Methodology", 
    "Risk Management",
    "Case Study",
    "M&A",
    "Digital Strategy"
  ];

  const trendingTopics = [
    "Corridor Economics",
    "Strategic Planning",
    "Risk Management",
    "Global Markets",
    "Supply Chain",
    "M&A Strategy"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Strategic Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Thought leadership on corridor economics, strategic thinking, and transforming 
            complexity into competitive advantage.
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search insights..." 
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <select className="px-3 py-2 bg-background border border-input rounded-md text-sm">
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Article */}
        <Card className="shadow-elegant overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={featuredArticle.image} 
                alt={featuredArticle.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="space-y-4">
                <Badge variant="secondary">{featuredArticle.category}</Badge>
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{featuredArticle.publishDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                </div>
                <Button className="mt-4">
                  Read Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Articles */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Latest Insights</h2>
            <div className="space-y-6">
              {articles.map((article, index) => (
                <Card key={index} className="shadow-elegant hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground hover:text-accent transition-colors cursor-pointer">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{article.publishDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Newsletter Signup */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Strategic Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get weekly insights on corridor economics and strategic thinking delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input placeholder="Your email address" type="email" />
                  <Button className="w-full" size="sm">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Join 2,500+ strategic leaders. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.slice(1).map((category, index) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Apply These Insights?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Transform strategic thinking into strategic action. Let's discuss how corridor 
              economics can unlock new opportunities for your organization.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              Schedule Strategic Consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}