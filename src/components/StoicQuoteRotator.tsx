import { useState, useEffect } from 'react';

interface Quote {
  text: string;
  author: string;
}

const stoicQuotes: Quote[] = [
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius"
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "The best revenge is not to be like your enemy.",
    author: "Marcus Aurelius"
  },
  {
    text: "Every new beginning comes from some other beginning's end.",
    author: "Seneca"
  },
  {
    text: "It is not the man who has too little, but the man who craves more, who is poor.",
    author: "Seneca"
  },
  {
    text: "The willing, destiny guides them. The unwilling, destiny drags them.",
    author: "Seneca"
  },
  {
    text: "No one can hurt you without your permission.",
    author: "Epictetus"
  },
  {
    text: "Wealth consists in not having great possessions, but in having few wants.",
    author: "Epictetus"
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus"
  },
  {
    text: "Nothing is permanent except change.",
    author: "Heraclitus"
  },
  {
    text: "The path up and down are one and the same.",
    author: "Heraclitus"
  },
  {
    text: "Big results require big ambitions.",
    author: "Heraclitus"
  }
];

export const StoicQuoteRotator = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Always start with Marcus Aurelius (first 3 quotes)
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % stoicQuotes.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = stoicQuotes[currentQuoteIndex];

  return (
    <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <blockquote className="text-xl md:text-2xl text-muted-foreground font-light italic mb-4 transition-all duration-500">
        "{currentQuote.text}"
      </blockquote>
      <cite className="text-foreground text-sm transition-all duration-500">
        — {currentQuote.author}
      </cite>
      
      {/* Strategic thinking icon */}
      <div className="mt-6 flex justify-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
          <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};