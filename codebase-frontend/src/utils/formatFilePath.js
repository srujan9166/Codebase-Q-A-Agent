/**
 * Utility functions for formatting file paths and line numbers
 */

export function getFileName(path) {
  if (!path) return 'Unknown File';
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1];
}

export function formatLineRange(startLine, endLine) {
  if (!startLine && !endLine) return '';
  if (startLine === endLine) return `Line ${startLine}`;
  return `Lines ${startLine}–${endLine}`;
}

export function cleanPath(path) {
  if (!path) return '';
  const srcIndex = path.toLowerCase().indexOf('\\src\\');
  if (srcIndex !== -1) {
    return path.substring(srcIndex + 1).replace(/\\/g, '/');
  }
  const testIndex = path.toLowerCase().indexOf('\\test\\');
  if (testIndex !== -1) {
    return path.substring(testIndex + 1).replace(/\\/g, '/');
  }
  return path.replace(/\\/g, '/');
}
