
import React from 'react';

const parseInline = (text: string): React.ReactNode[] => {
    // 1. Handle Bold: **text**
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    
    return boldParts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        
        // 2. Handle Italic: *text* (simple implementation, avoids collision with list markers at start of line)
        // We only split by * if it's surrounded by spaces or boundaries to be safe, 
        // but for simple AI output, strict * wrapping usually works.
        const italicParts = part.split(/(\*.*?\*)/g);
        return italicParts.map((subPart, j) => {
             // Check length > 2 to avoid matching just "**" if something went wrong
             if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
                 return <em key={`${i}-${j}`} className="italic">{subPart.slice(1, -1)}</em>;
             }
             return <span key={`${i}-${j}`}>{subPart}</span>;
        });
    });
};

const parseMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = (keyPrefix: string) => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`${keyPrefix}-list`} className="list-disc pl-5 mb-3 space-y-1">
                    {listItems}
                </ul>
            );
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('### ')) {
            flushList(`pre-h3-${index}`);
            elements.push(<h3 key={`h3-${index}`} className="text-sm md:text-base font-bold mt-4 mb-2 uppercase tracking-wide opacity-90">{parseInline(trimmed.replace('### ', ''))}</h3>);
            return;
        }
        if (trimmed.startsWith('## ')) {
            flushList(`pre-h2-${index}`);
            elements.push(<h2 key={`h2-${index}`} className="text-lg md:text-xl font-bold mt-5 mb-3">{parseInline(trimmed.replace('## ', ''))}</h2>);
            return;
        }

        // List Items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            listItems.push(<li key={`li-${index}`}>{parseInline(content)}</li>);
            return;
        }

        // Standard Paragraphs
        if (trimmed === '') {
            flushList(`pre-break-${index}`);
            // Optional: elements.push(<div key={`br-${index}`} className="h-2" />);
        } else {
            flushList(`pre-p-${index}`);
            elements.push(<p key={`p-${index}`} className="mb-2 last:mb-0 leading-relaxed">{parseInline(line)}</p>);
        }
    });

    flushList('end');

    return elements;
};

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    return <div className={`markdown-content ${className}`}>{parseMarkdown(content)}</div>;
};
