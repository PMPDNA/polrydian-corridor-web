import { useEffect, useRef, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { ArticleImageUpload } from '@/components/ArticleImageUpload';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = lazy(() => import('react-quill'));

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'color', 'background', 'align',
  'link', 'image', 'blockquote', 'code-block'
];

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your content here...", 
  className,
  disabled = false
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null);

  // Import styles dynamically
  useEffect(() => {
    import('react-quill/dist/quill.snow.css');
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <Suspense fallback={
        <div className="w-full h-64 border border-input rounded-md bg-background flex items-center justify-center">
          Loading editor...
        </div>
      }>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.375rem',
            minHeight: '300px'
          }}
        />
      </Suspense>
      
      {/* Image Upload Section - Moved to end of editor */}
      <div className="mt-4">
        <ArticleImageUpload 
          onImageInsert={(url) => {
            // Insert image at cursor position in the editor
            if (quillRef.current) {
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection();
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, 'image', url);
            }
          }}
        />
      </div>
      
      {/* Custom styles for dark/light theme compatibility */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .ql-editor {
            min-height: 300px;
            font-family: inherit;
            color: hsl(var(--foreground));
            background-color: hsl(var(--background));
          }
          
          .ql-toolbar {
            border-color: hsl(var(--border));
            background-color: hsl(var(--muted));
          }
          
          .ql-container {
            border-color: hsl(var(--border));
          }
          
          .ql-snow .ql-tooltip {
            background-color: hsl(var(--popover));
            border-color: hsl(var(--border));
            color: hsl(var(--popover-foreground));
          }
          
          .ql-snow .ql-stroke {
            stroke: hsl(var(--foreground));
          }
          
          .ql-snow .ql-fill {
            fill: hsl(var(--foreground));
          }
          
          .ql-snow .ql-picker-label {
            color: hsl(var(--foreground));
          }
          
          .ql-snow .ql-picker-options {
            background-color: hsl(var(--popover));
            border-color: hsl(var(--border));
          }
          
          .ql-snow .ql-picker-item:hover {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          }
        `
      }} />
    </div>
  );
}