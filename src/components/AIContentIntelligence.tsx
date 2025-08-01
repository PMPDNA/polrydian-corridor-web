import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Hash, 
  Target,
  Sparkles,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

interface ContentSuggestions {
  headlines: string[];
  hashtags: string[];
  bestTimes: string[];
  engagementTips: string[];
  trending_topics: string[];
}

interface OptimizationResult {
  score: number;
  suggestions: string[];
  readability: number;
  seo_keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export function AIContentIntelligence() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState<ContentSuggestions | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!content.trim() && !title.trim()) {
      toast({
        title: "Content Required",
        description: "Please provide either a title or content to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock AI suggestions for demonstration
      // In production, this would call an OpenAI edge function
      const mockSuggestions: ContentSuggestions = {
        headlines: [
          "5 Key Economic Indicators Every Investor Should Watch",
          "Breaking Down Market Volatility: What It Means for Your Portfolio",
          "The Future of Financial Markets: Trends to Watch in 2024"
        ],
        hashtags: [
          "#EconomicInsights", "#MarketAnalysis", "#InvestmentStrategy",
          "#FinancialPlanning", "#EconomicTrends", "#MarketVolatility"
        ],
        bestTimes: [
          "Tuesday 10:00 AM (EST) - Peak engagement for financial content",
          "Wednesday 2:00 PM (EST) - High professional audience activity", 
          "Thursday 9:00 AM (EST) - Market opening analysis optimal"
        ],
        engagementTips: [
          "Add data visualizations to increase engagement by 40%",
          "Include actionable insights for better reader retention",
          "Use question-based CTAs to drive comments and discussion"
        ],
        trending_topics: [
          "Federal Reserve Interest Rates",
          "Inflation Impact Analysis", 
          "Tech Stock Market Trends",
          "Cryptocurrency Regulation",
          "ESG Investment Strategies"
        ]
      };

      const mockOptimization: OptimizationResult = {
        score: 78,
        suggestions: [
          "Add more specific data points and statistics",
          "Include call-to-action for better engagement",
          "Consider breaking longer paragraphs for readability",
          "Add relevant internal links to other articles"
        ],
        readability: 85,
        seo_keywords: ["economic analysis", "market trends", "investment strategy"],
        sentiment: 'positive'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuggestions(mockSuggestions);
      setOptimization(mockOptimization);
      
      toast({
        title: "Analysis Complete",
        description: "AI content intelligence has analyzed your content",
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate content suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Content Intelligence</h2>
          <p className="text-muted-foreground">
            Get AI-powered suggestions to optimize your content performance
          </p>
        </div>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          AI suggestions are currently using demo data. Connect OpenAI API for full functionality.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
          <CardDescription>
            Enter your content or title to get AI-powered insights and suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Article Title (Optional)
            </label>
            <Input
              id="title"
              placeholder="Enter your article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              placeholder="Paste your article content here for analysis..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={generateSuggestions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Generate AI Suggestions'}
          </Button>
        </CardContent>
      </Card>

      {suggestions && optimization && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="timing">Best Times</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Headline Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestions.headlines.map((headline, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{headline}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(headline)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Hashtag Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.hashtags.map((hashtag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => copyToClipboard(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Engagement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestions.engagementTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-secondary/20 rounded">
                      <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Content Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(optimization.score)}`}>
                    {optimization.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Overall content quality</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Readability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(optimization.readability)}`}>
                    {optimization.readability}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Reading ease score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold capitalize ${getSentimentColor(optimization.sentiment)}`}>
                    {optimization.sentiment}
                  </div>
                  <p className="text-sm text-muted-foreground">Content tone analysis</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimization.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {optimization.seo_keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Optimal Posting Times
                </CardTitle>
                <CardDescription>
                  Best times to publish for maximum engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.bestTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Topics
                </CardTitle>
                <CardDescription>
                  Current hot topics in your industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestions.trending_topics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{topic}</span>
                      <Badge variant="secondary">Trending</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}