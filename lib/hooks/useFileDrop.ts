import { useCallback, useRef, useState, type DragEvent } from "react";

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read file."));
    reader.readAsText(file);
  });
}

type UseFileDropResult = {
  isDragging: boolean;
  dropProps: {
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
};

export function useFileDrop(
  onText: (text: string) => void,
  onError?: (message: string) => void,
): UseFileDropResult {
  const [isDragging, setIsDragging] = useState(false);
  // Counter avoids the dragleave-fires-on-children footgun: enter children
  // increments, leave decrements, only flip false when we've truly left.
  const dragCountRef = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    dragCountRef.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCountRef.current -= 1;
    if (dragCountRef.current <= 0) {
      dragCountRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    // preventDefault on dragover is required to make drop fire.
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      dragCountRef.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      readFileAsText(file)
        .then(onText)
        .catch((err: unknown) => {
          onError?.(
            err instanceof Error ? err.message : "Could not read file.",
          );
        });
    },
    [onText, onError],
  );

  return {
    isDragging,
    dropProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
