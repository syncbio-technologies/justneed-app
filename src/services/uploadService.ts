export const isLocalUri = (uri?: string | null) => {
  if (!uri) return false;
  // Check for various local URI schemes used by DocumentPicker and file system
  return uri.startsWith('file://') || 
         uri.startsWith('content://') || 
         uri.startsWith('/') || // Absolute path
         uri.startsWith('ph://'); // Photos library
};

// Basic mime inference fallback when picker omits mimeType
export const inferMimeType = (fileName: string): string => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
};
