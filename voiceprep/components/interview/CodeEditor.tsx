'use client';

import { useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

const languageMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
};

export function CodeEditor({ code, language, onChange, readOnly = false }: CodeEditorProps) {
  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value ?? '');
    },
    [onChange]
  );

  return (
    <div
      className="overflow-hidden"
      style={{
        height: '100%',
        width: '100%',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Editor
        height="100%"
        language={languageMap[language] ?? 'python'}
        value={code}
        onChange={handleChange}
        theme="vs"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          bracketPairColorization: { enabled: true },
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('voiceprep-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#FAFAF8',
              'editor.lineHighlightBackground': '#F4F3F0',
              'editorLineNumber.foreground': '#9E9E9E',
              'editorLineNumber.activeForeground': '#6B6B6B',
              'editor.selectionBackground': '#1664D622',
              'editorBracketMatch.background': '#1664D611',
              'editorBracketMatch.border': '#1664D644',
            },
          });
        }}
        onMount={(editor, monaco) => {
          monaco.editor.setTheme('voiceprep-light');
        }}
      />
    </div>
  );
}
