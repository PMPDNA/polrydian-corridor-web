import React, { useState } from 'react'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageLoadingSpinner } from '@/components/LoadingStates'
import { Search, Filter, Clock, User, Tag, ExternalLink } from 'lucide-react'

export const AdvancedSearchComponent: React.FC = () => {
  const {
    query,
    results,
    loading,
    totalResults,
    search,
    clearSearch,
    setFilters,
    availableTags
  } = useAdvancedSearch()

  const [searchInput, setSearchInput] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')

  const handleSearch = () => {
    search(searchInput, {
      type: selectedType === 'all' ? undefined : selectedType,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy: sortBy as any
    })
  }

  const handleClear = () => {
    setSearchInput('')
    setSelectedType('all')
    setSelectedTags([])
    setSortBy('relevance')
    clearSearch()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄'
      case 'insight': return '📊'
      case 'partner': return '🤝'
      case 'service': return '⚡'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800'
      case 'insight': return 'bg-green-100 text-green-800'
      case 'partner': return 'bg-purple-100 text-purple-800'
      case 'service': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, insights, partners..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <PageLoadingSpinner /> : 'Search'}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[120px]">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="insight">Insights</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[120px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Filter by Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {query && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Results
              </span>
              <Badge variant="secondary">
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <PageLoadingSpinner />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map(result => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getTypeIcon(result.type)}</span>
                          <h3 className="font-semibold text-lg">
                            <a 
                              href={result.url}
                              className="hover:text-primary transition-colors"
                            >
                              {result.title}
                            </a>
                          </h3>
                          <Badge variant="outline" className={getTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                        </div>

                        {/* Highlights */}
                        {result.highlights.length > 0 && (
                          <div className="mb-3">
                            {result.highlights.slice(0, 2).map((highlight, index) => (
                              <p key={index} className="text-sm text-muted-foreground italic">
                                "...{highlight}..."
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {result.metadata.author && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {result.metadata.author}
                            </span>
                          )}
                          {result.metadata.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(result.metadata.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            Score: {Math.round(result.relevanceScore)}
                          </span>
                        </div>

                        {/* Tags */}
                        {result.metadata.tags && result.metadata.tags.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {result.metadata.tags.slice(0, 5).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" asChild>
                        <a href={result.url}>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-2">Try different keywords or adjust your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}