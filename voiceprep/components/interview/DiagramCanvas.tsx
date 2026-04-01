'use client';

import dynamic from 'next/dynamic';

interface DiagramCanvasProps {
  onChange?: (elements: readonly any[]) => void;
  readOnly?: boolean;
}

// Excalidraw must be lazy-loaded — it requires browser APIs
const ExcalidrawWrapper = dynamic(
  () =>
    import('@excalidraw/excalidraw').then((mod) => {
      const { Excalidraw } = mod;
      // Return a wrapper component that passes props correctly
      function Wrapper(props: DiagramCanvasProps) {
        return (
          <Excalidraw
            initialData={{
              appState: {
                theme: 'light' as const,
                gridModeEnabled: false,
                zenModeEnabled: true,
                viewBackgroundColor: '#FAFAF8',
                viewModeEnabled: props.readOnly ?? false,
              },
            }}
            onChange={(elements: readonly any[]) => {
              props.onChange?.(elements);
            }}
          />
        );
      }
      Wrapper.displayName = 'ExcalidrawWrapper';
      return Wrapper;
    }),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: 14,
          color: 'var(--text-tertiary)',
        }}
      >
        Loading whiteboard...
      </div>
    ),
  },
);

export function DiagramCanvas({ onChange, readOnly = false }: DiagramCanvasProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <ExcalidrawWrapper onChange={onChange} readOnly={readOnly} />
    </div>
  );
}
