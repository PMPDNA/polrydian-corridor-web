import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface EnhancedSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  canonicalUrl?: string;
}

export function EnhancedSEO({
  title = "Polrydian Corridor Web - Strategic Economic Intelligence",
  description = "Transform strategic challenges into competitive advantages through corridor economics. Expert analysis of global trade flows, geopolitical risk, and economic pathways.",
  keywords = ["corridor economics", "strategic consulting", "geopolitical analysis", "trade flows", "economic intelligence"],
  image = "/images/polrydian-hero-bg.jpg",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Patrick Misiewicz",
  section,
  tags,
  canonicalUrl
}: EnhancedSEOProps) {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  const canonical = canonicalUrl || currentUrl;
  const fullTitle = title.includes("Polrydian") ? title : `${title} | Polrydian Corridor Web`;
  const keywordsString = keywords.join(", ");
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  // Generate comprehensive structured data
  const generateStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? "Article" : "Organization",
      "url": currentUrl,
      "name": type === 'article' ? fullTitle : "Polrydian Corridor Web",
      "description": description,
      "image": fullImageUrl,
    };

    if (type === 'article') {
      return {
        ...baseSchema,
        "@type": "Article",
        "headline": fullTitle,
        "author": {
          "@type": "Person",
          "name": author,
          "url": "https://polrydian.com/about"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Polrydian Corridor Web",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/images/polrydian-logo.png`
          }
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentUrl
        },
        "articleSection": section,
        "keywords": tags || keywords,
        "wordCount": description.length,
        "inLanguage": "en-US"
      };
    } else {
      return {
        ...baseSchema,
        "@type": "Organization",
        "sameAs": [
          "https://www.linkedin.com/in/patrick-misiewicz-mslscm-28299b40",
          "https://twitter.com/polrydian"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "availableLanguage": "English"
        },
        "founder": {
          "@type": "Person",
          "name": "Patrick Misiewicz"
        },
        "knowsAbout": [
          "Corridor Economics",
          "Strategic Consulting",
          "Geopolitical Analysis", 
          "Supply Chain Management",
          "Market Entry Strategy"
        ]
      };
    }
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbData = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return null;

    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      }
    ];

    pathSegments.forEach((segment, index) => {
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      const url = `${window.location.origin}/${pathSegments.slice(0, index + 1).join('/')}`;
      
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": url
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    };
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Polrydian Corridor Web" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@polrydian" />
      <meta name="twitter:site" content="@polrydian" />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="theme-color" content="#0f172a" />
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="width" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title="Polrydian Corridor Web RSS Feed" href="https://qemtvnwemcpzhvbwjbsk.supabase.co/functions/v1/generate-rss" />
      
      {/* Structured Data - Main Schema */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
      
      {/* Structured Data - Breadcrumbs */}
      {generateBreadcrumbData() && (
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbData())}
        </script>
      )}
      
      {/* Website Schema for Homepage */}
      {location.pathname === '/' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Polrydian Corridor Web",
            "url": window.location.origin,
            "description": description,
            "publisher": {
              "@type": "Organization",
              "name": "Polrydian Corridor Web"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      )}
    </Helmet>
  );
}