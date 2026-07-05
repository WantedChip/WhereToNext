import os
import re
import json
import time
import random
import glob
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
import trafilatura

# Constant Headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

RAW_DIR = "raw"
MANIFEST_PATH = os.path.join(RAW_DIR, "_manifest.json")

def get_existing_urls_from_data():
    """Reads all existing files in data/*.md and extracts their source_url to skip them."""
    urls = set()
    for filepath in glob.glob("data/*.md"):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                # Find source_url in frontmatter
                match = re.search(r'source_url:\s*["\']?(https?://[^\s"\']+)["\']?', content)
                if match:
                    # Normalize URL by stripping trailing slash
                    url = match.group(1).strip().rstrip("/")
                    urls.add(url)
        except Exception as e:
            print(f"Error reading {filepath} for source_url: {e}")
    return urls

def get_clean_slug(url):
    """Extracts a clean slug from the URL."""
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return "homepage"
    # Take the last part of the path
    slug = path.split("/")[-1]
    # Clean up non-alphanumeric characters except hyphens and underscores
    slug = re.sub(r"[^a-zA-Z0-9\-_]", "", slug)
    return slug.lower()

def load_manifest():
    """Loads raw/_manifest.json or returns an empty list."""
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading manifest: {e}. Starting fresh.")
    return []

def save_manifest(manifest):
    """Saves the manifest to raw/_manifest.json."""
    os.makedirs(RAW_DIR, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

def fetch_page_html(url):
    """Fetches HTML content of a URL using requests, falling back to Playwright if needed."""
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        if res.status_code != 200:
            print(f"Failed to fetch {url}: Status code {res.status_code}")
            return None
        return res.text
    except Exception as e:
        print(f"Error fetching {url} with requests: {e}")
        
    # Playwright fallback if requests fails
    try:
        from playwright.sync_api import sync_playwright
        print(f"Attempting Playwright fallback for {url}...")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent=HEADERS["User-Agent"])
            page.goto(url, wait_until="networkidle", timeout=30000)
            html = page.content()
            browser.close()
            return html
    except Exception as pe:
        print(f"Playwright fallback failed or not installed: {pe}")
        
    return None

def scrape():
    # Make sure output directory exists
    os.makedirs(RAW_DIR, exist_ok=True)

    # 1. Gather all URLs to skip
    manually_processed = get_existing_urls_from_data()
    print(f"Loaded {len(manually_processed)} existing manual URLs from data/ to skip.")

    manifest = load_manifest()
    scraped_urls = {item["source_url"].rstrip("/") for item in manifest}
    print(f"Loaded {len(scraped_urls)} previously scraped URLs from manifest.")

    skip_urls = manually_processed.union(scraped_urls)

    # Start at page 2 listing URL
    current_url = "https://www.hudsonandemily.com/category/travel/page/2/"
    page_num = 2

    # Loop through pagination
    while current_url:
        print(f"\n========================================")
        print(f"Processing listing page: {current_url} (Page {page_num})")
        print(f"========================================")

        html = fetch_page_html(current_url)
        if not html:
            print(f"Could not load listing page {current_url}. Stopping.")
            break

        soup = BeautifulSoup(html, "html.parser")
        
        # 3. Collect every article link and title
        # Selector for WordPress Elementor grid listing
        posts = soup.select("h2.elementor-post__title a, h3.elementor-post__title a")
        if not posts:
            # Fallback selector just in case structure changes
            posts = [a for a in soup.find_all("a", href=True) if "elementor-post__title" in a.find_parent().get("class", [])]

        articles_to_scrape = []
        for a in posts:
            link = a["href"].strip()
            title = a.get_text(strip=True)
            norm_link = link.rstrip("/")
            
            if norm_link in skip_urls:
                print(f"Skipping already processed article: {title} ({link})")
            else:
                articles_to_scrape.append((link, title))

        print(f"Found {len(articles_to_scrape)} new articles to scrape on this page out of {len(posts)} total.")

        # 4. Visit and scrape each article
        for idx, (url, title) in enumerate(articles_to_scrape, 1):
            print(f"\n--- Scraping article {idx} of {len(articles_to_scrape)}: {title} ({url}) ---")
            
            # Randomized delay
            delay = random.uniform(1.0, 2.5)
            print(f"Sleeping {delay:.2f} seconds...")
            time.sleep(delay)

            article_html = fetch_page_html(url)
            if not article_html:
                print(f"Failed to fetch article html for {url}")
                continue

            # Extract main content using trafilatura
            content_md = trafilatura.extract(article_html, output_format="markdown")
            
            # Playwright fallback if content is empty or near-empty
            if not content_md or len(content_md.strip()) < 100:
                print("Content is empty or near-empty with requests. Trying Playwright...")
                # Try Playwright fallback
                try:
                    from playwright.sync_api import sync_playwright
                    with sync_playwright() as p:
                        browser = p.chromium.launch(headless=True)
                        page = browser.new_page(user_agent=HEADERS["User-Agent"])
                        page.goto(url, wait_until="networkidle", timeout=30000)
                        pw_html = page.content()
                        browser.close()
                        content_md = trafilatura.extract(pw_html, output_format="markdown")
                except Exception as pe:
                    print(f"Playwright fallback failed or not installed: {pe}")

            if not content_md:
                print(f"Warning: Could not extract content from {url}")
                continue

            slug = get_clean_slug(url)
            output_filepath = os.path.join(RAW_DIR, f"{slug}.md")

            # 6. Save article
            try:
                with open(output_filepath, "w", encoding="utf-8") as out_f:
                    out_f.write(f"source_url: {url}\n")
                    out_f.write(f"scraped_title: {title}\n")
                    out_f.write("\n")
                    out_f.write(content_md)
                print(f"Successfully saved to {output_filepath}")

                # 7. Update manifest
                manifest.append({
                    "source_url": url,
                    "slug": slug,
                    "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                })
                save_manifest(manifest)
                # Keep tracked skipped list updated in memory
                skip_urls.add(url.rstrip("/"))
            except Exception as e:
                print(f"Error saving file {output_filepath}: {e}")

        # 2. Find Next page pagination link
        next_anchor = soup.select_one("a.page-numbers.next, a.next")
        if next_anchor and next_anchor.get("href"):
            next_url = next_anchor["href"].strip()
            # Prevent loop if it goes back
            if next_url == current_url:
                print("Next page URL is identical to current page URL. Stopping.")
                current_url = None
            else:
                current_url = next_url
                page_num += 1
        else:
            print("\nNo 'Next' page link found. Scraper finished.")
            current_url = None

if __name__ == "__main__":
    scrape()
