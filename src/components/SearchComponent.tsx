import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'page' | 'service' | 'article';
  tags: string[];
}

const searchData: SearchResult[] = [
  {
    id: '1',
    title: 'Strategic Consultation',
    description: 'Expert guidance through complex geopolitical environments and policy landscapes.',
    url: '/services',
    type: 'service',
    tags: ['strategy', 'consultation', 'geopolitical']
  },
  {
    id: '2',
    title: 'Corridor Economics',
    description: 'Strategic mapping and management of capital, technology, and expertise flows across global regions.',
    url: '/services',
    type: 'service',
    tags: ['corridor', 'economics', 'global', 'capital']
  },
  {
    id: '3',
    title: 'About Patrick Misiewicz',
    description: 'Founder of Polrydian Group, specializing in corridor economics and strategic transformation.',
    url: '/about',
    type: 'page',
    tags: ['about', 'founder', 'background']
  },
  {
    id: '4',
    title: 'Infrastructure & M&A',
    description: 'Complex project structuring across energy, transportation, and digital infrastructure sectors.',
    url: '/services',
    type: 'service',
    tags: ['infrastructure', 'mergers', 'acquisitions', 'energy']
  },
  {
    id: '5',
    title: 'Contact Us',
    description: "Get in touch to discuss how corridor economics can unlock new pathways for your organization.",
    url: '/#contact',
    type: 'page',
    tags: ['contact', 'consultation', 'inquiry']
  },
  {
    id: '6',
    title: 'Schedule Meeting',
    description: 'Book a strategic consultation call to discuss your project needs.',
    url: '/calendly-demo',
    type: 'page',
    tags: ['schedule', 'meeting', 'consultation', 'booking']
  }
];

export const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = searchData.filter(item => {
      const matchesQuery = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || item.type === selectedType;
      
      return matchesQuery && matchesType;
    });

    setResults(filtered);
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'page': return 'bg-green-100 text-green-800';
      case 'article': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services, pages, or content..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            if (query) handleSearch(query);
          }}
          className="px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Types</option>
          <option value="service">Services</option>
          <option value="page">Pages</option>
          <option value="article">Articles</option>
        </select>
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <a
                  key={result.id}
                  href={result.url}
                  className="block p-3 hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{result.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                        {result.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && results.length === 0 && query && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">No results found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try searching for services, about, contact, or schedule
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};