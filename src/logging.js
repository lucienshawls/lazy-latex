const vscode = require('vscode');

let outputChannel = null;

/**
 * Ensure we have a Lazy LaTeX output channel.
 */
function getOutputChannel() {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Lazy LaTeX');
  }
  return outputChannel;
}

/**
 * Log detailed LLM errors to the Lazy LaTeX output channel.
 * @param {Error} err
 * @param {string} contextMessage
 */
function logLlmError(err, contextMessage) {
  const channel = getOutputChannel();
  const config = vscode.workspace.getConfiguration('lazy-latex');
  const provider = config.get('llm.provider', 'openai');
  const endpoint = config.get('llm.endpoint', '');
  const model = config.get('llm.model', '');

  channel.appendLine('----------------------------------------');
  channel.appendLine(new Date().toISOString());
  channel.appendLine(contextMessage);
  channel.appendLine(`Provider (setting): ${provider}`);
  channel.appendLine(`Endpoint: ${endpoint}`);
  channel.appendLine(`Model: ${model}`);

  if (typeof err.status === 'number') {
    channel.appendLine(`HTTP status: ${err.status}`);
  }
  if (err.provider) {
    channel.appendLine(`Error provider (from error): ${err.provider}`);
  }
  channel.appendLine(`Error message: ${err.message || '<no message>'}`);

  if (err.details) {
    channel.appendLine('Error details (truncated):');
    const details =
      typeof err.details === 'string' ? err.details : JSON.stringify(err.details);
    channel.appendLine(details.slice(0, 2000)); // avoid dumping huge payloads
  }

  channel.appendLine('');
}

/**
 * Build a friendly error message for the user based on HTTP status.
 * @param {Error} err
 * @returns {string}
 */
function getFriendlyErrorMessage(err) {
  const status = typeof err.status === 'number' ? err.status : null;

  if (status === 401 || status === 403) {
    return 'Lazy LaTeX: LLM request failed (authentication). Please check your API key and provider settings. See the "Lazy LaTeX" output for details.';
  }
  if (status === 404) {
    return 'Lazy LaTeX: LLM request failed (404). This often means the model or endpoint is incorrect. Check your endpoint URL and model name. See the "Lazy LaTeX" output for details.';
  }
  if (status === 429) {
    return 'Lazy LaTeX: LLM request failed (rate limit). Your provider is throttling requests. Try again later or adjust your usage. See the "Lazy LaTeX" output for details.';
  }
  if (status && status >= 500 && status < 600) {
    return 'Lazy LaTeX: LLM provider returned a server error. Try again later. See the "Lazy LaTeX" output for details.';
  }

  return 'Lazy LaTeX: failed to contact the LLM or parse its response. Check your provider settings and see the "Lazy LaTeX" output for details.';
}

module.exports = {
  logLlmError,
  getFriendlyErrorMessage,
  getOutputChannel,
};
