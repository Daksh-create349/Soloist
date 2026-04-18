"""
Soloist Agent — PDF Resume Generator
Converts Markdown resume → HTML → styled PDF.
Uses Playwright to render the HTML flawlessly into a PDF.
"""

import markdown2
from pathlib import Path
from playwright.async_api import async_playwright

# Professional resume CSS
RESUME_CSS = """
@page {
    size: A4;
    margin: 0;
}

body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a2e;
    margin: 1.5cm 2cm;
}

h1 {
    font-size: 22pt;
    color: #0f3460;
    border-bottom: 3px solid #533483;
    padding-bottom: 6px;
    margin-bottom: 12px;
}

h2 {
    font-size: 14pt;
    color: #533483;
    border-bottom: 1.5px solid #e0d6f0;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

h3 {
    font-size: 12pt;
    color: #0f3460;
    margin-top: 10px;
    margin-bottom: 4px;
}

ul {
    padding-left: 20px;
    margin-top: 4px;
    margin-bottom: 8px;
}

li {
    margin-bottom: 4px;
}

strong {
    color: #0f3460;
}

em {
    color: #555;
}

a {
    color: #533483;
    text-decoration: none;
}

p {
    margin-bottom: 6px;
    margin-top: 6px;
}

code {
    background: #f0ecf7;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 10pt;
    color: #533483;
}

hr {
    border: none;
    border-top: 1px solid #e0d6f0;
    margin: 14px 0;
}
"""

async def generate_pdf(markdown_content: str, output_path: str | Path) -> Path:
    """
    Convert Markdown resume content to a styled PDF using Playwright.

    Args:
        markdown_content: The Markdown string (tailored resume)
        output_path: Where to save the generated file

    Returns:
        Path to the generated PDF file
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Force extension to be PDF
    output_path = output_path.with_suffix('.pdf')

    # Markdown → HTML
    html_body = markdown2.markdown(
        markdown_content,
        extras=["fenced-code-blocks", "tables", "header-ids", "strike", "task_list"]
    )

    # Wrap in full HTML document with CSS
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>{RESUME_CSS}</style>
</head>
<body>
{html_body}
</body>
</html>"""

    # Playwright → PDF
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Load the HTML content
        await page.set_content(full_html, wait_until="networkidle")
        
        # Print to PDF
        await page.pdf(
            path=str(output_path),
            format="A4",
            print_background=True,
            margin={"top": "0cm", "bottom": "0cm", "left": "0cm", "right": "0cm"}
        )
        await browser.close()

    print(f"  📄 Saved stylized resume as PDF: {output_path}")
    return output_path
