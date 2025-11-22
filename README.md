# Lazy LaTeX

Write LaTeX math *lazily* using your favorite LLM.

Type fuzzy / natural language math between tiny markers, hit **Enter**, and Lazy LaTeX turns it into real LaTeX — right inside your `.tex` or `.md` file.

------

## What it does (in 10 seconds)

In a LaTeX or Markdown file, you can write:

```tex
This is ;;integral from 0 to 1 of x squared dx;;.

;;;sum from i=1 to n of a_i;;;
```

Press **Enter** and it becomes:

```tex
This is $\int_0^1 x^2\,dx$.

\[
\sum_{i=1}^n a_i
\]
```

You can also select any text and run
 **`Lazy LaTeX: Convert selection to math`** (Ctrl+Alt+M) to turn it into a single LaTeX math expression.

Lazy LaTeX works with **OpenAI**, **Anthropic Claude**, **Gemini (OpenAI-compatible)**, or any OpenAI-style chat API you point it at.

------

## Quick start (2 minutes)

1. **Install the extension**
    Search for **“Lazy LaTeX”** in the VS Code Extensions view and install it.

2. **Open a LaTeX or Markdown project**
    Open a folder that contains `.tex` or `.md` files.

3. **Configure your LLM**
    In VS Code, go to **Settings → search “Lazy LaTeX”**.
    Set at least:

   - `Lazy-latex › Llm: Provider`
     - `openai` | `anthropic` | `gemini`
   - `Lazy-latex › Llm: Endpoint`
   - `Lazy-latex › Llm: Api Key`
   - `Lazy-latex › Llm: Model`

   Examples:

   - **OpenAI**
     - Provider: `openai`
     - Endpoint: `https://api.openai.com/v1/chat/completions`
     - Model: `gpt-4o-mini` (or similar)
   - **Anthropic (Claude)**
     - Provider: `anthropic`
     - Endpoint: `https://api.anthropic.com/v1/messages`
     - Model: `claude-haiku-4-5` (or another Claude 3 model)
   - **Gemini (OpenAI-compatible)**
     - Provider: `gemini`
     - Endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
     - Model: `gemini-2.5-flash` (or similar)

4. **Try it once**
    In a `.tex` or `.md` file:

   ```tex
   This is ;;integral from 0 to 1 of x squared dx;;.
   ```

   Press **Enter** → the `;;…;;` is replaced with real LaTeX math.

That’s enough to start using it.

------

## How you actually use it

### 1. Auto-convert wrappers on Enter

In **LaTeX** and **Markdown** files:

- `;; ... ;;` → **inline math**
- `;;; ... ;;;` → **display math**

Write for example:

```tex
The pdf is ;;normal(0, 1);;.

;;;sum from i=1 to n of a_i;;;
```

When you press **Enter** on that line:

- The wrappers are removed
- The content inside is converted to LaTeX
- Math is wrapped in appropriate delimiters

You can turn auto-conversion off or on via:

- `lazy-latex.autoReplace` (default `true`)


#### Output delimiters

- In **LaTeX**, you can choose how the math is wrapped:

  - Inline:
    - `lazy-latex.output.latex.inlineStyle = "dollar"` → `$...$` (default)
    - `lazy-latex.output.latex.inlineStyle = "paren"` → `\(...\)`
  - Display:
    - `lazy-latex.output.latex.displayStyle = "brackets"` → `\[...\]` (default)
    - `lazy-latex.output.latex.displayStyle = "dollars"` → `$$...$$`

- In **Markdown**, output is always `$...$` for inline math and `$$...$$` for display.

------

### 2. Manual command: convert selection

If you don’t want wrappers, or you’re editing existing text:

1. Select some text (natural language or messy math).
2. Run the command:
   - Command Palette: **“Lazy LaTeX: Convert selection to math”**
   - Or default keybinding: **Ctrl+Alt+M**

The selection is replaced by a **single LaTeX math expression** (no surrounding `$` or `$$`).

This works in both `.tex` and `.md` files.

------

## Making the LLM follow your notation

You control the “style” of math in two layers.

### 1. Per-project conventions: `.lazy-latex.md` (HIGH priority)

In your project root, create:

- `.lazy-latex.md`

Write anything you want the model to follow for this project, for example:

```markdown
# LaTeX conventions for this project

- Use \mathbf for vectors.
- Use \mathbb for sets and number systems.
- Use \mathrm{d}x in integrals.
- f(x) always denotes a probability density function on \mathbb{R}.
```

This is treated as **high-priority**: project-specific rules.

### 2. Global/workspace extras: `lazy-latex.prompt.extra` (LOWER priority)

In VS Code settings, there is:

- `Lazy-latex › Prompt: Extra` (`lazy-latex.prompt.extra`)

Anything you put there is appended as extra system instructions.

If both exist:

- `.lazy-latex.md` = **HIGH PRIORITY** (project rules)
- `lazy-latex.prompt.extra` = **LOWER PRIORITY** (generic rules)

Lazy LaTeX tells the LLM explicitly to obey the project file over the global setting.

------

## Context awareness (so it “remembers” nearby text)

Lazy LaTeX sends some of your document as context so the LLM can use earlier definitions and keep notation consistent.

### Previous lines

- `lazy-latex.context.lines` (integer, default `50`)

Controls how many **previous lines** are sent as context. For example:

- `0` → no previous lines (only the current line + your prompts)
- `10`, `50`, … → last N lines above the current line
- A large value (`9999`) → effectively the entire file above the current line

### Current line and multiple wrappers

When you press Enter:

- The **full current line** (with `;;...;;` / `;;;...;;;` still present) is sent too.
- If a line has multiple wrappers, they are sent **together** in one request, so the LLM can keep them consistent.

For example:

```tex
Let ;;vec u, v in RRn;;. Write ;;u = (column vector with u_i);; and ;;v = (similar as u);;. Then we have ;;;u + v = (col vec with entry-wise addition);;;.
```

can turn into something like:

```tex
Let $\vec{u}, \vec{v} \in \mathbb{R}^n$. Write
$\vec{u} = \begin{pmatrix} u_1 \\ \cdots \\ u_n \end{pmatrix}$
and
$\vec{v} = \begin{pmatrix} v_1 \\ \cdots \\ v_n \end{pmatrix}$.
Then we have
\[
\vec{u} + \vec{v}
= \begin{pmatrix} u_1 + v_1 \\ \cdots \\ u_n + v_n \end{pmatrix}.
\]
```

All generated in one go, with consistent notation.

------

## Optional: keep your original input as comments

If you like to see what you originally typed, enable:

- `lazy-latex.keepOriginalComment` (default `false`)

When it’s `true`, before rewriting a line, Lazy LaTeX inserts your original line as a comment above it:

- In **LaTeX**:

  ```tex
  % [lazy-latex input] This is ;;integral from 0 to 1 of x squared dx;;
  This is $\int_0^1 x^2 \, dx$
  ```

- In **Markdown**:

  ```md
  <!-- [lazy-latex input] This is ;;integral from 0 to 1 of x squared dx;; -->
  $$
  \int_0^1 x^2 \, dx
  $$
  ```

Handy for debugging or learning how the LLM is interpreting your text.

------

## Configuration (quick reference)

Open **Settings** → search for `Lazy LaTeX`.

Key options:

- `lazy-latex.autoReplace` (boolean, default `true`)
   Automatically convert `;;...;;` and `;;;...;;;` wrappers on Enter in `.tex` / `.md` files.
- `lazy-latex.llm.provider` (string, default `"openai"`)
   Which provider to use:
  - `"openai"` — OpenAI-compatible chat completion APIs
  - `"anthropic"` — Claude via Anthropic Messages API
  - `"gemini"` — Gemini via Google’s OpenAI-compatible endpoint
- `lazy-latex.llm.endpoint` (string)
   Endpoint URL for your provider, e.g.:
  - OpenAI: `https://api.openai.com/v1/chat/completions`
  - Anthropic: `https://api.anthropic.com/v1/messages`
  - Gemini: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- `lazy-latex.llm.apiKey` (string, secret)
   API key for your provider.
- `lazy-latex.llm.model` (string)
   Model name used for generation, e.g.:
  - OpenAI: `gpt-4o-mini`
  - Anthropic: `claude-haiku-4-5`
  - Gemini: `gemini-2.5-flash`
- `lazy-latex.prompt.extra` (string)
   Extra global/workspace instructions (lower priority than `.lazy-latex.md`).
- `lazy-latex.context.lines` (integer, default `50`)
   Number of previous lines to send as context.
- `lazy-latex.output.latex.inlineStyle` (string: `"dollar"` | `"paren"`, default `"dollar"`)
   How to wrap inline math in LaTeX: `$...$` vs `\(...\)`.
- `lazy-latex.output.latex.displayStyle` (string: `"brackets"` | `"dollars"`, default `"brackets"`)
   How to wrap display math in LaTeX: `\[...\]` vs `$$...$$`.
- `lazy-latex.keepOriginalComment` (boolean, default `false`)
   Insert the original line as a comment above the generated LaTeX.

------

## Requirements

- VS Code `^1.106.0`
- An LLM provider:
  - OpenAI-compatible chat completion endpoint, or
  - Anthropic Claude Messages API, or
  - Gemini OpenAI-compatible endpoint
- A valid API key and model name for that provider

------

## Notes

- Auto-replacement only runs in files with language id `latex` or `markdown`.
- Wrappers on pure comment lines (`% ...` in LaTeX and `<!-- ... -->` in Markdown) are ignored.
- The extension does **not** store your API key or send telemetry; it just forwards prompts to your configured endpoint.