const CHUNK_SIZE = 500; // ~500 tokens worth of characters
const CHUNK_OVERLAP = 100;

export function chunkText(text: string): string[] {
  const cleanText = text.replace(/\n{3,}/g, "\n\n").trim();

  if (cleanText.length <= CHUNK_SIZE) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + CHUNK_SIZE;

    if (end < cleanText.length) {
      // Try to break at a sentence or paragraph boundary
      const searchArea = cleanText.slice(start + CHUNK_SIZE - 100, end + 50);
      const breakPoints = ["\n\n", ".\n", ". ", "? ", "! ", "\n"];

      for (const bp of breakPoints) {
        const idx = searchArea.lastIndexOf(bp);
        if (idx !== -1) {
          end = start + CHUNK_SIZE - 100 + idx + bp.length;
          break;
        }
      }
    } else {
      end = cleanText.length;
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - CHUNK_OVERLAP;
    if (start >= cleanText.length) break;
  }

  return chunks;
}
