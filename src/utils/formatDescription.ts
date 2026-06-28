// Format job description text into structured paragraphs
export const formatJobDescription = (text: string): string => {
  if (!text) return '';
  
  // Split by newlines and filter empty lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Join with double newline for paragraph spacing
  return lines.join('\n\n');
};

// Parse description into simple paragraphs
export const parseJobDescription = (text: string) => {
  if (!text) return [];
  
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => ({
    type: 'text' as const,
    content: String(line.trim())
  }));
};
