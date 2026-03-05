import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import './RichTextContent.css';

function linkIcon(href: string): string {
  const h = (href || '').toLowerCase();
  if (h.includes('docs.google.com') || h.includes('drive.google.com') && h.includes('/document')) return '📄';
  if (h.includes('sheets.google.com') || h.includes('drive.google.com') && h.includes('/spreadsheet')) return '📊';
  if (h.endsWith('.pdf') || h.includes('pdf')) return '📕';
  if (h.includes('youtube.com') || h.includes('youtu.be') || h.includes('vimeo.com')) return '🎬';
  return '🔗';
}

const defaultComponents: Components = {
  a: ({ href, children, ...props }) => {
    const icon = linkIcon(href || '');
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="rich-text-link" {...props}>
        <span className="rich-text-link-icon" aria-hidden>{icon}</span>
        <span>{children}</span>
      </a>
    );
  },
};

type Props = {
  content: string;
  className?: string;
  components?: Components;
};

export default function RichTextContent({ content, className = '', components }: Props) {
  if (!content || !content.trim()) return null;
  return (
    <div className={`rich-text-content ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{ ...defaultComponents, ...components }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
