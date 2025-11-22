// wrappers.js

/**
 * Find all ;;...;; (inline), ;;;...;;; (display), and ;;;;...;;;; (anything)
 * wrappers in a single line.
 *
 * Returns an array of:
 *   { type: 'inline' | 'display' | 'anything', inner: string, start: number, end: number }
 * where start/end are character indices in the line (end = index after closing delimiters).
 *
 * - For LaTeX, lines whose trimmed text starts with '%' are ignored completely.
 * - For Markdown, pure HTML comment lines <!-- ... --> are ignored completely.
 *
 * @param {string} lineText
 * @param {string} languageId  e.g. 'latex' or 'markdown'
 * @returns {Array<{ type: string, inner: string, start: number, end: number }>}
 */
function findWrappersInLine(lineText, languageId) {
  const trimmed = lineText.trim();

  // LaTeX comment line
  if (languageId === 'latex' && trimmed.startsWith('%')) {
    return [];
  }

  // Markdown / HTML-style pure comment line: <!-- ... -->
  if (
    languageId === 'markdown' &&
    trimmed.startsWith('<!--') &&
    trimmed.endsWith('-->')
  ) {
    return [];
  }

  const results = [];
  const n = lineText.length;
  let i = 0;

  while (i < n) {
    if (lineText[i] === ';') {
      // Count how many consecutive semicolons
      let j = i;
      while (j < n && lineText[j] === ';') {
        j++;
      }
      const count = j - i;

      if (count === 2 || count === 3 || count === 4) {
        let type;
        if (count === 2) {
          type = 'inline';
        } else if (count === 3) {
          type = 'display';
        } else {
          type = 'anything';
        }

        const contentStart = j;

        // Look for matching closing delimiter of the same length
        let k = contentStart;
        let found = false;

        while (k < n) {
          if (lineText[k] === ';') {
            let m = k;
            while (m < n && lineText[m] === ';') {
              m++;
            }
            const endCount = m - k;

            if (endCount === count) {
              const contentEnd = k;
              const inner = lineText.slice(contentStart, contentEnd);
              results.push({
                type,
                inner,
                start: i,
                end: m, // index AFTER the closing delimiters
              });

              i = m; // continue parsing after this wrapper
              found = true;
              break;
            } else {
              k = m; // skip this run of semicolons
            }
          } else {
            k++;
          }
        }

        if (!found) {
          // No closing delimiter found; just move on to avoid infinite loop
          i = j;
        }
      } else {
        // 1 or >=5 semicolons: ignore as wrapper
        i = j;
      }
    } else {
      i++;
    }
  }

  return results;
}

module.exports = {
  findWrappersInLine,
};
