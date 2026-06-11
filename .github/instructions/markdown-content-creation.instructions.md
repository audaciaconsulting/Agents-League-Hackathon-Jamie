---
description: "Markdown guidelines and content creation standards for blog posts"
applyTo: "**/*.md"
---

# Markdown Content Rules

## Formatting and Structure

Follow these guidelines for formatting and structuring your markdown content:

- **Headings**: Use `##` for H2 and `###` for H3. Ensure that headings are used in a hierarchical manner. Recommend restructuring if content includes H4, and more strongly recommend for H5.
- **Lists**: Use `-` for bullet points and `1.` for numbered lists. Indent nested lists with two spaces.
- **Code Blocks**: Use triple backticks (```) to create fenced code blocks. Specify the language after the opening backticks for syntax highlighting (e.g., `csharp`).
- **Links**: Use `[link text](URL)` for links. Ensure that the link text is descriptive and the URL is valid.
- **Images**: Use `![alt text](image URL)` for images. Include a brief description of the image in the alt text.
- **Tables**: Use `|` to create tables. Ensure that columns are properly aligned and headers are included.
- **Line Length**: Break lines at 80 characters to improve readability. Use soft line breaks for long paragraphs.
- **Whitespace**: Use blank lines to separate sections and improve readability. Avoid excessive whitespace.

## Validation Checklist

Ensure compliance with the following validation requirements:

### Front Matter

- `post_title`: The title of the post.
- `author1`: The primary author of the post.
- `post_slug`: The URL slug for the post.
- `microsoft_alias`: The Microsoft alias of the author.
- `featured_image`: The URL of the featured image.
- `categories`: The categories for the post. These categories must be from the list in /categories.txt.
- `tags`: The tags for the post.
- `ai_note`: Indicate if AI was used in the creation of the post.
- `summary`: A brief summary of the post. Recommend a summary based on the content when possible.
- `post_date`: The publication date of the post.

### Content and Formatting

- Content follows the markdown content rules specified above.
- Content is properly formatted and structured according to the guidelines.
- Validation tools have been run to check for compliance with the rules and guidelines.
