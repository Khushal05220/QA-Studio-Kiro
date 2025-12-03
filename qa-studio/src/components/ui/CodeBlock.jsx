import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import { Icons } from './Icons';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);

export function CodeBlock({ code, language = 'javascript', showCopy = true, showLineNumbers = false }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (codeRef.current && code) {
      try {
        codeRef.current.innerHTML = hljs.highlight(code, { language }).value;
      } catch {
        codeRef.current.textContent = code;
      }
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative group">
      {showCopy && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? (
            <Icons.Check className="w-4 h-4 text-green-400" />
          ) : (
            <Icons.Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}
      <div className="bg-gray-950 rounded-lg overflow-auto">
        <pre className="p-4 text-sm">
          {showLineNumbers ? (
            <table className="w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-gray-600 select-none text-right w-8">{i + 1}</td>
                    <td><code ref={i === 0 ? codeRef : null} className="hljs">{line}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code ref={codeRef} className="hljs">{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
