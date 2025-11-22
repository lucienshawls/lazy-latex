// context.js
const vscode = require('vscode');

/**
 * Get context from previous N lines before a given line number.
 * N is read from `lazy-latex.context.lines`.
 *
 * If contextLines = 0, returns an empty string.
 * If contextLines is large, this may include the entire file above the line.
 *
 * @param {vscode.TextDocument} document
 * @param {number} lineNumber
 * @returns {string}
 */
function getContextBeforeLine(document, lineNumber) {
  const config = vscode.workspace.getConfiguration('lazy-latex');
  const contextLines = config.get('context.lines', 50);

  if (!contextLines || contextLines <= 0) {
    return '';
  }

  const startLine = Math.max(0, lineNumber - contextLines);
  const endLine = lineNumber - 1;

  if (endLine < startLine) {
    return '';
  }

  const lines = [];
  for (let ln = startLine; ln <= endLine; ln++) {
    lines.push(document.lineAt(ln).text);
  }
  return lines.join('\n');
}

module.exports = {
  getContextBeforeLine,
};
