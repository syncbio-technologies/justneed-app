export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  };
  return date.toLocaleDateString('en-US', options);
};