#!/usr/bin/env python3
"""
scripts/parse_problem_descriptions.py
Joins problem descriptions from neenza/leetcode-problems with
company mapping data from liquidslr repo to produce enriched_problems.json.

Usage:
    python3 parse_problem_descriptions.py \
        --problems-path ../leetcode-problems/merged_problems.json \
        --company-data ./data/problems/all_problems.json \
        --output ./data/problems/enriched_problems.json
"""

import json
import re
import argparse
from collections import defaultdict
from pathlib import Path


def clean_description(desc: str) -> str:
    """Clean up description text — remove HTML tags, normalize whitespace."""
    if not desc:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', desc)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def parse_examples(examples_raw: list) -> list:
    """Parse examples from neenza format into structured format."""
    parsed = []
    for ex in examples_raw:
        text = ex.get("example_text", "")
        if not text:
            continue

        # Try to extract input/output/explanation
        input_match = re.search(r'Input:\s*(.+?)(?:\n|Output:)', text, re.DOTALL)
        output_match = re.search(r'Output:\s*(.+?)(?:\n|Explanation:|$)', text, re.DOTALL)
        explanation_match = re.search(r'Explanation:\s*(.+?)$', text, re.DOTALL)

        parsed.append({
            "input": input_match.group(1).strip() if input_match else "",
            "output": output_match.group(1).strip() if output_match else "",
            "explanation": explanation_match.group(1).strip() if explanation_match else "",
        })

    return parsed


def load_neenza_problems(path: str) -> dict:
    """Load neenza/leetcode-problems merged JSON.
    Returns dict keyed by problem_slug."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data.get("questions", data) if isinstance(data, dict) else data

    by_slug = {}
    for p in questions:
        slug = p.get("problem_slug", "")
        if not slug:
            continue

        by_slug[slug] = {
            "title": p.get("title", ""),
            "problem_id": p.get("problem_id"),
            "frontend_id": p.get("frontend_id"),
            "difficulty": p.get("difficulty", ""),
            "topics": p.get("topics", []) or [],
            "description": p.get("description", ""),
            "description_text": clean_description(p.get("description", "")),
            "examples": parse_examples(p.get("examples", []) or []),
            "constraints": p.get("constraints", []) or [],
            "hints": p.get("hints", []) or [],
            "follow_ups": p.get("follow_ups", []) or [],
            "code_snippets": p.get("code_snippets", {}) or {},
            "solution": p.get("solution", "") or "",
        }

    return by_slug


def load_company_problems(path: str) -> dict:
    """Load all_problems.json from our company parser.
    Returns dict keyed by slug."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    problems = data.get("problems", data) if isinstance(data, dict) else data

    by_slug = {}
    for p in problems:
        slug = p.get("slug", "")
        if slug:
            by_slug[slug] = p

    return by_slug


def join_datasets(descriptions: dict, company_data: dict) -> tuple:
    """Join problem descriptions with company intelligence."""
    enriched = []
    matched = 0
    desc_only = 0
    company_only = 0

    # All slugs from both datasets
    all_slugs = set(descriptions.keys()) | set(company_data.keys())

    for slug in all_slugs:
        desc = descriptions.get(slug)
        company = company_data.get(slug)

        problem = {"slug": slug}

        # Base info — prefer company data title (consistent casing)
        if company:
            problem["title"] = company.get("title", "")
            problem["difficulty"] = company.get("difficulty", "")
            problem["link"] = company.get("link", "")
            problem["companies"] = company.get("companies", [])
            problem["company_frequency"] = company.get("company_frequency", {})
            problem["acceptance_rate"] = company.get("acceptance_rate", 0)
        elif desc:
            problem["title"] = desc.get("title", "")
            problem["difficulty"] = desc.get("difficulty", "").upper()
            problem["link"] = f"https://leetcode.com/problems/{slug}"
            problem["companies"] = []
            problem["company_frequency"] = {}
            problem["acceptance_rate"] = 0

        # Topics — merge from both sources, deduplicate
        topics_set = set()
        if company and company.get("topics"):
            topics_set.update(company["topics"])
        if desc and desc.get("topics"):
            topics_set.update(desc["topics"])
        problem["topics"] = sorted(topics_set)

        # Description content from neenza
        if desc:
            problem["has_description"] = True
            problem["description"] = desc.get("description", "")
            problem["description_text"] = desc.get("description_text", "")
            problem["examples"] = desc.get("examples", [])
            problem["constraints"] = desc.get("constraints", [])
            problem["hints"] = desc.get("hints", [])
            problem["follow_ups"] = desc.get("follow_ups", [])
            problem["code_snippets"] = desc.get("code_snippets", {})
            problem["has_solution"] = bool(desc.get("solution"))
            problem["frontend_id"] = desc.get("frontend_id")
        else:
            problem["has_description"] = False
            problem["description"] = ""
            problem["description_text"] = ""
            problem["examples"] = []
            problem["constraints"] = []
            problem["hints"] = []
            problem["follow_ups"] = []
            problem["code_snippets"] = {}
            problem["has_solution"] = False
            problem["frontend_id"] = None

        # Track match type
        if desc and company:
            matched += 1
        elif desc and not company:
            desc_only += 1
        else:
            company_only += 1

        enriched.append(problem)

    # Sort: problems with both desc + company data first, then by company count
    enriched.sort(key=lambda x: (
        -int(x["has_description"]),
        -len(x.get("companies", [])),
    ))

    return enriched, matched, desc_only, company_only


def main():
    parser = argparse.ArgumentParser(
        description="Join problem descriptions with company data"
    )
    parser.add_argument("--problems-path", required=True,
                        help="Path to neenza merged_problems.json")
    parser.add_argument("--company-data", required=True,
                        help="Path to our all_problems.json")
    parser.add_argument("--output", required=True,
                        help="Output path for enriched problems JSON")
    args = parser.parse_args()

    print("Loading problem descriptions...")
    descriptions = load_neenza_problems(args.problems_path)
    print(f"  {len(descriptions)} problems with descriptions")

    print("Loading company problem data...")
    company_data = load_company_problems(args.company_data)
    print(f"  {len(company_data)} problems with company tags")

    print("Joining datasets...")
    enriched, matched, desc_only, company_only = join_datasets(descriptions, company_data)

    print(f"  {matched} matched (description + company tags)")
    print(f"  {desc_only} description only (no company tags)")
    print(f"  {company_only} company tags only (no description — likely premium)")
    print(f"  {len(enriched)} total enriched problems")

    # Save
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump({
            "total": len(enriched),
            "with_descriptions": matched + desc_only,
            "with_company_tags": matched + company_only,
            "matched_both": matched,
            "problems": enriched,
        }, f, indent=2)
    print(f"  Saved to {output_path}")

    # Summary
    diff_counts = defaultdict(int)
    for p in enriched:
        diff_counts[p.get("difficulty", "UNKNOWN")] += 1
    print(f"\n  Difficulty: EASY={diff_counts.get('EASY', 0) + diff_counts.get('Easy', 0)} "
          f"MEDIUM={diff_counts.get('MEDIUM', 0) + diff_counts.get('Medium', 0)} "
          f"HARD={diff_counts.get('HARD', 0) + diff_counts.get('Hard', 0)}")


if __name__ == "__main__":
    main()
