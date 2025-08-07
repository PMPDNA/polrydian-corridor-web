import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  article?: boolean
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export function SEOEnhancements({
  title = "Patrick Misiewicz | Polrydian Group | Strategic Consulting & Corridor Economics",
  description = "Strategic consulting in corridor economics—mapping flows of capital, technology, and expertise to transform complex global challenges into competitive advantages. Proven results: 60% faster market entry, $200M investment optimization.",
  keywords = ["strategic consulting", "corridor economics", "geopolitical strategy", "supply chain optimization", "M&A advisory", "infrastructure consulting", "global strategy", "Patrick Misiewicz", "Polrydian Group"],
  image = "https://polrydian.com/og-image.jpg",
  article = false,
  author = "Patrick Misiewicz",
  publishedTime,
  modifiedTime,
  section = "Strategy",
  tags = []
}: SEOProps) {
  const location = useLocation()
  const currentUrl = `https://polrydian.com${location.pathname}`
  
  // Generate schema.org structured data
  const generateStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": article ? "Article" : "WebPage",
      "headline": title,
      "description": description,
      "url": currentUrl,
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": author,
        "url": "https://polrydian.com",
        "sameAs": [
          "https://www.linkedin.com/in/patrickmisiewicz",
          "https://twitter.com/PatrickMisiewicz"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Polrydian Group",
        "url": "https://polrydian.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://polrydian.com/logo.png"
        }
      }
    }

    if (article) {
      return {
        ...baseSchema,
        "@type": "Article",
        "articleSection": section,
        "keywords": [...keywords, ...tags],
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentUrl
        }
      }
    }

    return baseSchema
  }

  const structuredData = generateStructuredData()

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" type="application/rss+xml" title="Polrydian Articles RSS" href="https://polrydian.com/rss.xml" />
      <link rel="sitemap" type="application/xml" title="Sitemap" href="https://polrydian.com/sitemap.xml" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Polrydian Group" />
      <meta property="og:locale" content="en_US" />
      
      {article && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:section" content={section} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@PatrickMisiewicz" />
      <meta name="twitter:site" content="@PolrydianGroup" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="application-name" content="Polrydian Group" />
      <meta name="apple-mobile-web-app-title" content="Polrydian Group" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Performance and Accessibility */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    </Helmet>
  )
}