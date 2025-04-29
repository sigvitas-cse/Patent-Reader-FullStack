// Utility function to escape special regex characters
function escapeRegExp(string) {
    if (!string || typeof string !== 'string') {
      return '';
    }
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Clean text by removing unwanted patterns
  function cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text.replace(/\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g, '');
  }
  
  // Count words in text
  function countWords(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    return text.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  }
  
  // Count paragraphs in text
  function countParagraphs(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    return text.split('\n').filter(line => line.trim() !== '').length;
  }
  
  module.exports = { escapeRegExp, cleanText, countWords, countParagraphs };