# Lazy LaTeX

Write LaTeX math lazily using an LLM.

Lazy LaTeX lets you type fuzzy / natural language math and turns it into real LaTeX formulas, either:

- **Automatically**, using special wrappers like `;;...;;` and `;;;...;;;` when you press Enter in a `.tex` file.
- **Manually**, via a command that converts the current selection.

You bring your own LLM (OpenAI / Anthropic Claude / Gemini via OpenAI-compatible endpoint, or any OpenAI-compatible HTTP API), and you can tune notation conventions per project with a simple text file.

---

## Features

### 1. Auto-convert `;;...;;` and `;;;...;;;` on Enter

In LaTeX files (`.tex`, language `latex`):

- `;; ... ;;` → **inline math**
- `;;; ... ;;;` → **display math**

Example:

```tex
This is ;;integral from 0 to 1 of x squared dx;;.

And here is display:

;;;sum from i=1 to n of a_i;;;
```

After you press **Enter** on that line, Lazy LaTeX will:

- Call your configured LLM
- Replace wrappers with real LaTeX:

```latex
This is $\int_0^1 x^2\,dx$.

And here is display:

\[
\sum_{i=1}^n a_i
\]
```

Auto replacement can be enabled/disabled via a setting.

---

### 2. Manual command: convert selection to LaTeX

You can also select any text (natural language or messy LaTeX) and run:

- **Command Palette** → `Lazy LaTeX: Convert selection to math`
- Or the default keybinding: **Ctrl+Alt+M**

The selected text is replaced by a single LaTeX math expression (no surrounding `$`).

---

### 3. Per-project conventions with `.lazy-latex.md`

In each project, you can create a file named `.lazy-latex.md` in the workspace root, and write any instructions you want the LLM to follow for this project, for example:

```latex
# LaTeX conventions for this project

- Use \mathbf for vectors.
- Use \mathbb for number sets.
- Use \mathrm{d}x in integrals.
- f(x) always denotes a probability density function on \mathbb{R}.
```

Lazy LaTeX will read this file and include it in the system prompt as **high-priority project settings**.

---

### 4. Extra instructions via VS Code settings

There is also a user/workspace setting:

- `lazy-latex.prompt.extra`

Anything you put there is appended to the system prompt as **lower-priority user settings**.

If both exist:

- `.lazy-latex.md` is treated as **HIGH PRIORITY**
- `lazy-latex.prompt.extra` is treated as **LOWER PRIORITY**

The system prompt roughly looks like:

```md
Rules:
- Output ONLY the LaTeX math expression itself.
- No $ or $$.
- No explanations or comments.

Additional instructions follow.

HIGH PRIORITY from project settings:
<contents of .lazy-latex.md>

LOWER PRIORITY from user settings:
<lazy-latex.prompt.extra>
```


---

### 5. Context from surrounding lines

Lazy LaTeX can send a few **previous lines** of your document as context to the LLM, so it can:

- Respect definitions introduced earlier,
- Keep notation consistent across multiple formulas.

The number of previous lines is controlled by `lazy-latex.context.lines` (default `50`).  
Set it to:

- `0` to disable context,
- A large number (e.g. `9999`) to send the entire file above the current line.

The **current line** (raw, with wrappers) is always included in the context for auto-replacement.

---

### 6. Original input as comments (optional)

If you like an “audit trail”, you can enable:

- `lazy-latex.keepOriginalComment` (boolean)

When enabled, before auto-replacing a line, Lazy LaTeX will insert the original line as a LaTeX comment just above it, e.g.:

```tex
% [lazy-latex input] This is ;;integral from 0 to 1 of x squared dx;;
This is $\int_0^1 x^2 \, dx$
```

Note: Lazy LaTeX ignores wrappers that appear on lines that are pure LaTeX comments (lines starting with `%`).

### 7. Multiple wrappers on the same line

When a line contains multiple wrappers, Lazy LaTeX sends **all of them together** in a single LLM call, along with the full current line and previous context. This lets the model keep things consistent, e.g.:

```tex
Let ;;vec u, v in RRn;;. Write ;;u = (column vector with u_i);; and ;;v = (similar as u);;. Then we have ;;;u + v = (col vec with entry-wise addition);;;.
```

will generate matching LaTeX in one go:


```tex
Let $\vec{u}, \vec{v} \in \mathbb{R}^n$. Write $\vec{u} = \begin{pmatrix} u_1 \\ u_2 \\ \vdots \\ u_n \end{pmatrix}$ and $\vec{v} = \begin{pmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{pmatrix}$. Then we have \[
\vec{u} + \vec{v} = \begin{pmatrix} u_1 + v_1 \\ u_2 + v_2 \\ \vdots \\ u_n + v_n \end{pmatrix}
\].
```


---

## Configuration

Open **Settings** → search for `Lazy LaTeX`.

Available options:

- **`lazy-latex.autoReplace`** (boolean, default `true`)  
  Automatically convert `;;...;;` and `;;;...;;;` wrappers on Enter in `.tex` files.

- **`lazy-latex.llm.provider`** (string, default `"openai"`)  
  Which provider to use:
  - `"openai"` — OpenAI-compatible chat completion APIs  
  - `"anthropic"` — Claude via Anthropic Messages API  
  - `"gemini"` — Gemini via Google’s OpenAI-compatible endpoint

- **`lazy-latex.llm.endpoint`** (string)  
  HTTP endpoint for your provider, for example:
  - OpenAI: `https://api.openai.com/v1/chat/completions`  
  - Anthropic: `https://api.anthropic.com/v1/messages`  
  - Gemini (OpenAI-compatible): `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`

- **`lazy-latex.llm.apiKey`** (string, secret)  
  API key for your LLM provider.

- **`lazy-latex.llm.model`** (string)  
  Model name used for generation, e.g.:
  - OpenAI: `gpt-4o-mini`  
  - Anthropic: `claude-haiku-4-5`  
  - Gemini: `gemini-2.5-flash`

- **`lazy-latex.prompt.extra`** (string)  
  Extra system-level instructions (lower priority than `.lazy-latex.md`).

- **`lazy-latex.context.lines`** (integer, default `50`)  
  Number of previous lines to send as context to the LLM.  
  `0` disables context; large values mean “entire file above the current line”.

- **`lazy-latex.keepOriginalComment`** (boolean, default `false`)  
  If enabled, when auto-replacing wrappers on a line, insert the original line as a preceding LaTeX comment.

---

## Requirements

- VS Code `^1.106.0`
- An LLM provider and endpoint, for example:
  - OpenAI-compatible chat completion endpoint
  - Anthropic Claude Messages API
  - Gemini OpenAI-compatible endpoint
- A valid API key and model name


---

## Usage

1. Open a folder with your LaTeX project in VS Code.
2. (Optional) Create `.lazy-latex.md` in the project root and describe your notation conventions.
3. Configure at least:
   - `Lazy-latex › Llm: Provider` (e.g. `openai`, `anthropic`, or `gemini`)
   - `Lazy-latex › Llm: Endpoint`
   - `Lazy-latex › Llm: Api Key`
   - `Lazy-latex › Llm: Model`
4. In a `.tex` file:
   - Type `;;your math description;;` or `;;;your display math description;;;`
   - Press **Enter** → wrappers are replaced with LaTeX.
5. Or manually:
   - Select text → `Lazy LaTeX: Convert selection to math` (Ctrl+Alt+M).

---

## Notes

- Auto-replacement only runs in files with language id `latex` (e.g. `.tex`).
- The extension does not store your API key or send telemetry; it just forwards your prompts to the configured endpoint.
