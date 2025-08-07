import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeFormData, sanitizeHtml } from '@/lib/security';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Test component to verify corruption prevention pipeline
export function ArticleCorruptionTest() {
  const [testResults, setTestResults] = useState<{
    name: string;
    input: string;
    clientSanitized: string;
    formSanitized: string;
    passed: boolean;
  }[]>([]);

  const runTests = () => {
    const testCases = [
      {
        name: "Tripled characters",
        content: "<h2>Belarusian Elections</h2><p>The pppolitical crisis with Prprprpresident Lukashenko...</p>"
      },
      {
        name: "Empty HTML elements",
        content: "<h2>Title</h2><p></p><h3><br></h3><p>Content here</p>"
      },
      {
        name: "Normal content",
        content: "<h2>Normal Title</h2><p>This is normal content with no corruption.</p>"
      },
      {
        name: "Mixed corruption",
        content: "<h2>Belarus</h2><p></p><p>The rrrevolution and sssoviet era...</p><h3><br></h3>"
      }
    ];

    const results = testCases.map(testCase => {
      // Test client-side sanitization
      const clientSanitized = sanitizeHtml(testCase.content);
      
      // Test form data sanitization
      const formData = { content: testCase.content };
      const formSanitized = sanitizeFormData(formData).content;
      
      // Check if corruption was fixed
      const hasTrippledChars = /([a-z])\1{2,}/i.test(clientSanitized) || /([a-z])\1{2,}/i.test(formSanitized);
      const hasEmptyElements = /<(p|h[1-6]|div)><\/\1>/.test(clientSanitized) || /<(p|h[1-6]|div)[^>]*><br><\/\1>/.test(formSanitized);
      
      return {
        name: testCase.name,
        input: testCase.content,
        clientSanitized,
        formSanitized,
        passed: !hasTrippledChars && !hasEmptyElements
      };
    });

    setTestResults(results);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Article Corruption Prevention Test</CardTitle>
        <CardDescription>
          Test the sanitization pipeline to ensure content corruption is prevented
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests}>Run Corruption Tests</Button>
        
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{result.name}</h4>
                  <Badge variant={result.passed ? "default" : "destructive"}>
                    {result.passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <strong>Input:</strong>
                    <code className="block bg-muted p-2 rounded mt-1 text-xs break-all">
                      {result.input}
                    </code>
                  </div>
                  
                  <div>
                    <strong>Client Sanitized:</strong>
                    <code className="block bg-muted p-2 rounded mt-1 text-xs break-all">
                      {result.clientSanitized}
                    </code>
                  </div>
                  
                  <div>
                    <strong>Form Sanitized:</strong>
                    <code className="block bg-muted p-2 rounded mt-1 text-xs break-all">
                      {result.formSanitized}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}