# ═══════════════════════════════════════════════════════════════════════
# Soloist Opportunity Agent — Dockerfile
# Base: Playwright image with Python 3.12 (includes Chromium)
# ═══════════════════════════════════════════════════════════════════════

FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

# System dependencies for WeasyPrint PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    pango1.0-tools \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libcairo2-dev \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy dependency file first (for Docker cache)
COPY pyproject.toml ./

# Install dependencies with uv
RUN uv sync --frozen 2>/dev/null || uv pip install --system -r <(uv pip compile pyproject.toml)

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p data/uploads data/generated_pdfs chroma_db sqlite_db

# Install Playwright browsers
RUN playwright install chromium

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
