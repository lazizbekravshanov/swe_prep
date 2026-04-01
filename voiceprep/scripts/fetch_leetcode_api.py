#!/usr/bin/env python3
"""
scripts/fetch_leetcode_api.py
Fetches problem metadata from LeetCode's public GraphQL API.
Only fetches FREE (non-premium) problems.
Rate-limited to be respectful.

Usage:
    python3 fetch_leetcode_api.py --output-dir ./data/problems
    python3 fetch_leetcode_api.py --output-dir ./data/problems --fetch-details --rate-limit 1.0
"""

import json
import time
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    print("Install requests: pip3 install requests")
    raise SystemExit(1)

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "VoicePrep/1.0 (interview-prep-tool)",
}

ALL_PROBLEMS_QUERY = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      questionId
      questionFrontendId
      title
      titleSlug
      difficulty
      topicTags {
        name
        slug
      }
      isPaidOnly
      acRate
      likes
      dislikes
      categoryTitle
    }
  }
}
"""

PROBLEM_DETAIL_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    topicTags {
      name
      slug
    }
    codeSnippets {
      lang
      langSlug
      code
    }
    sampleTestCase
    exampleTestcases
    hints
    isPaidOnly
  }
}
"""


def fetch_all_problem_slugs(limit=3500):
    """Fetch all problem slugs from the problemset list."""
    response = requests.post(
        LEETCODE_GRAPHQL,
        json={
            "query": ALL_PROBLEMS_QUERY,
            "variables": {
                "categorySlug": "",
                "limit": limit,
                "skip": 0,
                "filters": {},
            },
        },
        headers=HEADERS,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    questions = data["data"]["problemsetQuestionList"]["questions"]
    return questions


def fetch_problem_detail(slug, rate_limit=1.0):
    """Fetch full problem details for a single problem."""
    time.sleep(rate_limit)
    response = requests.post(
        LEETCODE_GRAPHQL,
        json={
            "query": PROBLEM_DETAIL_QUERY,
            "variables": {"titleSlug": slug},
        },
        headers=HEADERS,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("data", {}).get("question")


def main():
    parser = argparse.ArgumentParser(
        description="Fetch problem metadata from LeetCode GraphQL API"
    )
    parser.add_argument("--output-dir", default="./data/problems")
    parser.add_argument("--rate-limit", type=float, default=1.0,
                        help="Seconds between API requests")
    parser.add_argument("--fetch-details", action="store_true",
                        help="Also fetch full problem descriptions (slow, ~3500 requests)")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: Fetch all problem metadata
    print("Fetching problem list from LeetCode API...")
    questions = fetch_all_problem_slugs()
    print(f"  Found {len(questions)} problems")

    # Filter free problems only
    free_questions = [q for q in questions if not q.get("isPaidOnly", False)]
    print(f"  {len(free_questions)} are free (non-premium)")

    # Save metadata
    metadata_file = output_dir / "api_metadata.json"
    with open(metadata_file, "w") as f:
        json.dump({
            "total": len(questions),
            "free": len(free_questions),
            "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "questions": free_questions,
        }, f, indent=2)
    print(f"  Saved metadata to {metadata_file}")

    # Step 2 (optional): Fetch full descriptions
    if args.fetch_details:
        print(f"Fetching problem details (rate limit: {args.rate_limit}s)...")
        details_dir = output_dir / "details"
        details_dir.mkdir(exist_ok=True)

        for i, q in enumerate(free_questions):
            slug = q["titleSlug"]
            detail_file = details_dir / f"{slug}.json"

            if detail_file.exists():
                continue  # skip already fetched

            try:
                detail = fetch_problem_detail(slug, args.rate_limit)
                if detail:
                    with open(detail_file, "w") as f:
                        json.dump(detail, f, indent=2)
            except Exception as e:
                print(f"  Error fetching {slug}: {e}")

            if (i + 1) % 50 == 0:
                print(f"  Fetched {i + 1}/{len(free_questions)}")

        print(f"  Done. Details saved to {details_dir}")


if __name__ == "__main__":
    main()
