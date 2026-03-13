import sys
import json
from duckduckgo_search import DDGS

def search(query, max_results=5):
    try:
        results = []
        with DDGS() as ddgs:
            # text search
            search_results = ddgs.text(query, max_results=max_results)
            if search_results:
                for r in search_results:
                    results.append({
                        "title": r.get("title", ""),
                        "link": r.get("href", ""),
                        "snippet": r.get("body", "")
                    })
        
        return json.dumps(results)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
    
    query = sys.argv[1]
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    print(search(query, max_results))
