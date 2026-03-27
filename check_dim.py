import sys
from playwright.sync_api import sync_playwright

def main():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            # Test mobile layout sizes
            sizes = [320, 375, 414]
            page = browser.new_page()
            
            for w in sizes:
                page.set_viewport_size({"width": w, "height": 812})
                page.goto("http://localhost:5757/")
                overflowing = page.evaluate("""() => {
                    let r = [];
                    for(let e of document.querySelectorAll('*')) {
                        if(e.scrollWidth > e.clientWidth && e.clientWidth > 0 && e.tagName != 'HTML' && e.tagName != 'BODY' && e.tagName != 'SCRIPT' && e.tagName != 'STYLE') {
                            r.push(e.tagName + '.' + e.className + ' (text: "' + e.innerText.substring(0,20) + '") w:' + e.clientWidth + ' s:' + e.scrollWidth);
                        }
                    }
                    return r.join('\\n');
                }""")
                if overflowing:
                    print(f"Viewport {w}: Overflow detected ->\\n{overflowing}\\n")
                else:
                    print(f"Viewport {w}: No overflow detected.")
            browser.close()
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
