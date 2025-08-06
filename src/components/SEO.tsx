import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function SEO({
  title = "Polrydian Corridor Web - Strategic Economic Intelligence",
  description = "Transform strategic challenges into competitive advantages through corridor economics. Expert analysis of global trade flows, geopolitical risk, and economic pathways.",
  keywords = ["corridor economics", "strategic consulting", "geopolitical analysis", "trade flows", "economic intelligence"],
  image = "/images/polrydian-hero-bg.jpg",
  url = "https://polrydian.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Patrick Misiewicz"
}: SEOProps) {
  const fullTitle = title.includes("Polrydian") ? title : `${title} | Polrydian Corridor Web`;
  const keywordsString = keywords.join(", ");

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Polrydian Corridor Web" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@polrydian" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? "Article" : "Organization",
          "name": type === 'article' ? fullTitle : "Polrydian Corridor Web",
          "description": description,
          "url": url,
          "image": image,
          "author": {
            "@type": "Person",
            "name": author
          },
          ...(type === 'website' && {
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
            }
          }),
          ...(type === 'article' && {
            "headline": fullTitle,
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "publisher": {
              "@type": "Organization",
              "name": "Polrydian Corridor Web",
              "logo": {
                "@type": "ImageObject",
                "url": "/images/polrydian-logo.png"
              }
            }
          })
        })}
      </script>
    </Helmet>
  );
}