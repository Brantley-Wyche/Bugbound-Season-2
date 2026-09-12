'use client';

import { useState } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';

export default function SourceFiles({
  files,
  vague,
}: {
  files: string[];
  vague?: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [copyError, setCopyError] = useState(false);
  async function copy(file: string) {
    setMessage('');
    try {
      await navigator.clipboard.writeText(file);
      setCopied(file);
      setCopyError(false);
      setMessage(`Copied ${file}`);
    } catch {
      setCopied(null);
      setCopyError(true);
      setMessage('Could not copy. Select the path and copy it from the page.');
    }
  }
  return (
    <div className="source-files">
      <h3>{vague ? 'Investigate these files' : 'Source files'}</h3>
      <ul>
        {files.map((file) => (
          <li key={file}>
            <FileCode2 size={15} aria-hidden="true" />
            <code translate="no">{file}</code>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Copy ${file}`}
                    onClick={() => void copy(file)}
                  />
                }
              >
                {copied === file ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
              </TooltipTrigger>
              <TooltipPopup className="desk-overlay dark">
                {copied === file ? 'Copied' : 'Copy path'}
              </TooltipPopup>
            </Tooltip>
          </li>
        ))}
      </ul>
      <p className={copyError ? 'source-feedback' : 'sr-only'} role="status">
        {message}
      </p>
    </div>
  );
}
