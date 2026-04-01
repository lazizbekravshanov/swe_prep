#!/usr/bin/env python3
"""
VoicePrep Data Parser
=====================
Parses the liquidslr/interview-company-wise-problems repo
into structured JSON for the VoicePrep interview agent.

Outputs:
  1. data/companies/profiles.json   — company profiles with difficulty distribution, top topics, problem counts
  2. data/problems/all_problems.json — deduplicated master problem bank with company tags
  3. data/problems/by_topic.json    — problems grouped by topic
  4. data/companies/{slug}.json     — per-company problem lists with time windows

Usage:
  python parse_company_problems.py --repo-path ./interview-company-wise-problems --output-dir ./data
"""

import csv
import json
import os
import re
import sys
import argparse
from collections import defaultdict
from pathlib import Path
from typing import Any


def slugify(name: str) -> str:
    """Convert company name to URL-safe slug."""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def parse_csv(filepath: str) -> list[dict]:
    """Parse a single CSV file into list of problem dicts."""
    problems = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if not row.get('Title'):
                    continue

                # Parse topics (may be quoted with commas inside)
                topics_raw = row.get('Topics', '')
                topics = [t.strip() for t in topics_raw.split(',') if t.strip() and t.strip() != 'Topics']

                # Parse frequency and acceptance
                try:
                    frequency = float(row.get('Frequency', 0))
                except (ValueError, TypeError):
                    frequency = 0.0

                try:
                    acceptance = float(row.get('Acceptance Rate', 0))
                except (ValueError, TypeError):
                    acceptance = 0.0

                problem = {
                    'title': row['Title'].strip(),
                    'difficulty': row.get('Difficulty', 'MEDIUM').strip().upper(),
                    'frequency': round(frequency, 1),
                    'acceptance_rate': round(acceptance * 100, 1) if acceptance < 1 else round(acceptance, 1),
                    'link': row.get('Link', '').strip(),
                    'topics': topics,
                }

                # Extract slug from LeetCode URL
                if problem['link']:
                    match = re.search(r'/problems/([^/]+)', problem['link'])
                    if match:
                        problem['slug'] = match.group(1)
                    else:
                        problem['slug'] = slugify(problem['title'])
                else:
                    problem['slug'] = slugify(problem['title'])

                problems.append(problem)
    except Exception as e:
        print(f"  Warning: Could not parse {filepath}: {e}", file=sys.stderr)

    return problems


def parse_company(company_dir: str, company_name: str) -> dict:
    """Parse all CSV files for a single company."""
    time_windows = {
        '1. Thirty Days.csv': '30d',
        '2. Three Months.csv': '90d',
        '3. Six Months.csv': '180d',
        '4. More Than Six Months.csv': '180d+',
        '5. All.csv': 'all',
    }

    company_data = {
        'name': company_name,
        'slug': slugify(company_name),
        'problems_by_window': {},
        'all_problems': [],
    }

    for filename, window_key in time_windows.items():
        filepath = os.path.join(company_dir, filename)
        if os.path.exists(filepath):
            problems = parse_csv(filepath)
            company_data['problems_by_window'][window_key] = problems
            if window_key == 'all':
                company_data['all_problems'] = problems

    # If no "all" file, use the largest available window
    if not company_data['all_problems']:
        for window in ['180d+', '180d', '90d', '30d']:
            if window in company_data['problems_by_window']:
                company_data['all_problems'] = company_data['problems_by_window'][window]
                break

    return company_data


def build_company_profile(company_data: dict) -> dict:
    """Build a company profile with stats from parsed data."""
    problems = company_data['all_problems']
    recent = company_data['problems_by_window'].get('30d', [])

    if not problems:
        return None

    # Difficulty distribution
    diff_counts = defaultdict(int)
    for p in problems:
        diff_counts[p['difficulty']] += 1
    total = len(problems)

    difficulty_distribution = {
        'easy': round(diff_counts.get('EASY', 0) / total, 2) if total > 0 else 0,
        'medium': round(diff_counts.get('MEDIUM', 0) / total, 2) if total > 0 else 0,
        'hard': round(diff_counts.get('HARD', 0) / total, 2) if total > 0 else 0,
    }

    # Top topics
    topic_counts = defaultdict(int)
    for p in problems:
        for topic in p['topics']:
            topic_counts[topic] += 1

    top_topics = sorted(topic_counts.items(), key=lambda x: -x[1])[:10]

    # Recent hot topics (from 30-day window)
    recent_topic_counts = defaultdict(int)
    for p in recent:
        for topic in p['topics']:
            recent_topic_counts[topic] += 1
    recent_hot_topics = sorted(recent_topic_counts.items(), key=lambda x: -x[1])[:5]

    # Highest frequency problems (most likely to appear)
    hot_problems = sorted(problems, key=lambda x: -x['frequency'])[:10]

    profile = {
        'name': company_data['name'],
        'slug': company_data['slug'],
        'total_problems': total,
        'recent_problems_30d': len(recent),
        'difficulty_distribution': difficulty_distribution,
        'top_topics': [{'topic': t, 'count': c} for t, c in top_topics],
        'recent_hot_topics': [{'topic': t, 'count': c} for t, c in recent_hot_topics],
        'highest_frequency_problems': [
            {
                'title': p['title'],
                'difficulty': p['difficulty'],
                'frequency': p['frequency'],
                'slug': p['slug'],
            }
            for p in hot_problems
        ],
        'interview_focus': _infer_interview_focus(top_topics, difficulty_distribution),
    }

    return profile


def _infer_interview_focus(top_topics: list, difficulty_dist: dict) -> dict:
    """Infer what this company focuses on in interviews."""
    topic_names = [t for t, _ in top_topics[:5]]

    focus = {
        'primary_categories': [],
        'style_notes': [],
    }

    # Infer primary categories
    dsa_topics = {'Array', 'Hash Table', 'String', 'Linked List', 'Binary Search',
                  'Two Pointers', 'Stack', 'Queue', 'Sorting', 'Tree', 'Binary Tree',
                  'Graph', 'DFS', 'BFS', 'Dynamic Programming', 'Greedy',
                  'Backtracking', 'Recursion', 'Heap (Priority Queue)', 'Trie',
                  'Sliding Window', 'Monotonic Stack', 'Prefix Sum', 'Matrix',
                  'Math', 'Bit Manipulation', 'Divide and Conquer', 'Union Find'}

    db_topics = {'Database', 'SQL'}
    design_topics = {'Design', 'System Design'}

    has_dsa = any(t in dsa_topics for t in topic_names)
    has_db = any(t in db_topics for t in topic_names)
    has_design = any(t in design_topics for t in topic_names)

    if has_dsa:
        focus['primary_categories'].append('dsa')
    if has_db:
        focus['primary_categories'].append('database')
    if has_design:
        focus['primary_categories'].append('system_design')
    if not focus['primary_categories']:
        focus['primary_categories'].append('dsa')

    # Style notes based on difficulty
    if difficulty_dist.get('hard', 0) >= 0.3:
        focus['style_notes'].append('Heavy on hard problems — expect complex algorithmic challenges')
    elif difficulty_dist.get('easy', 0) >= 0.4:
        focus['style_notes'].append('Mix of easy-medium — focuses on clean code and communication')
    else:
        focus['style_notes'].append('Balanced difficulty — prepare across all levels')

    if any(t in topic_names for t in ['Dynamic Programming', 'Graph']):
        focus['style_notes'].append('Emphasizes DP and graph problems')
    if any(t in topic_names for t in ['Sliding Window', 'Two Pointers']):
        focus['style_notes'].append('Common pattern: sliding window and two-pointer techniques')
    if any(t in topic_names for t in ['Tree', 'Binary Tree']):
        focus['style_notes'].append('Tree traversal problems are frequently asked')

    return focus


def build_master_problem_bank(all_company_data: list) -> dict:
    """Build deduplicated master problem bank with company tags."""
    problems_map = {}  # slug -> problem with company list

    for company_data in all_company_data:
        company_name = company_data['name']
        for window_key, problems in company_data['problems_by_window'].items():
            for p in problems:
                slug = p['slug']
                if slug not in problems_map:
                    problems_map[slug] = {
                        'title': p['title'],
                        'slug': slug,
                        'difficulty': p['difficulty'],
                        'acceptance_rate': p['acceptance_rate'],
                        'link': p['link'],
                        'topics': p['topics'],
                        'companies': [],
                        'company_frequency': {},
                    }

                # Add company tag if not already present
                if company_name not in problems_map[slug]['companies']:
                    problems_map[slug]['companies'].append(company_name)

                # Track frequency per company (use the highest)
                existing_freq = problems_map[slug]['company_frequency'].get(company_name, 0)
                if p['frequency'] > existing_freq:
                    problems_map[slug]['company_frequency'][company_name] = p['frequency']

    # Sort problems by number of companies (most common across companies first)
    sorted_problems = sorted(
        problems_map.values(),
        key=lambda x: -len(x['companies'])
    )

    return {
        'total_unique_problems': len(sorted_problems),
        'problems': sorted_problems,
    }


def build_topic_index(master_bank: dict) -> dict:
    """Group problems by topic."""
    topic_map = defaultdict(list)

    for p in master_bank['problems']:
        for topic in p['topics']:
            topic_map[topic].append({
                'title': p['title'],
                'slug': p['slug'],
                'difficulty': p['difficulty'],
                'companies_count': len(p['companies']),
            })

    # Sort each topic's problems by company count (most universal first)
    result = {}
    for topic in sorted(topic_map.keys()):
        problems = sorted(topic_map[topic], key=lambda x: -x['companies_count'])
        result[topic] = {
            'count': len(problems),
            'problems': problems,
        }

    return result


def main():
    parser = argparse.ArgumentParser(description='Parse interview-company-wise-problems repo')
    parser.add_argument('--repo-path', default='./interview-company-wise-problems',
                        help='Path to cloned repo')
    parser.add_argument('--output-dir', default='./data',
                        help='Output directory for JSON files')
    args = parser.parse_args()

    repo_path = Path(args.repo_path)
    output_dir = Path(args.output_dir)

    if not repo_path.exists():
        print(f"Error: Repo path {repo_path} does not exist", file=sys.stderr)
        sys.exit(1)

    # Create output dirs
    (output_dir / 'companies').mkdir(parents=True, exist_ok=True)
    (output_dir / 'problems').mkdir(parents=True, exist_ok=True)

    # Parse all companies
    print("Parsing company data...")
    all_company_data = []
    company_profiles = []

    company_dirs = sorted([
        d for d in repo_path.iterdir()
        if d.is_dir() and not d.name.startswith('.')
    ])

    for company_dir in company_dirs:
        company_name = company_dir.name
        company_data = parse_company(str(company_dir), company_name)
        all_company_data.append(company_data)

        # Build profile
        profile = build_company_profile(company_data)
        if profile:
            company_profiles.append(profile)

            # Save per-company file
            company_file = output_dir / 'companies' / f"{profile['slug']}.json"
            with open(company_file, 'w') as f:
                json.dump({
                    'profile': profile,
                    'problems_by_window': company_data['problems_by_window'],
                }, f, indent=2)

    print(f"  Parsed {len(company_profiles)} companies")

    # Sort profiles by total problems (descending)
    company_profiles.sort(key=lambda x: -x['total_problems'])

    # Save master profiles list
    profiles_file = output_dir / 'companies' / 'profiles.json'
    with open(profiles_file, 'w') as f:
        json.dump({
            'total_companies': len(company_profiles),
            'companies': company_profiles,
        }, f, indent=2)
    print(f"  Saved profiles to {profiles_file}")

    # Build master problem bank
    print("Building master problem bank...")
    master_bank = build_master_problem_bank(all_company_data)

    bank_file = output_dir / 'problems' / 'all_problems.json'
    with open(bank_file, 'w') as f:
        json.dump(master_bank, f, indent=2)
    print(f"  {master_bank['total_unique_problems']} unique problems saved to {bank_file}")

    # Build topic index
    print("Building topic index...")
    topic_index = build_topic_index(master_bank)

    topic_file = output_dir / 'problems' / 'by_topic.json'
    with open(topic_file, 'w') as f:
        json.dump(topic_index, f, indent=2)
    print(f"  {len(topic_index)} topics indexed to {topic_file}")

    # Print summary
    print("\n" + "=" * 60)
    print("VOICEPREP DATA SUMMARY")
    print("=" * 60)
    print(f"Companies:          {len(company_profiles)}")
    print(f"Unique problems:    {master_bank['total_unique_problems']}")
    print(f"Topics:             {len(topic_index)}")
    print()
    print("Top 15 companies by problem count:")
    for p in company_profiles[:15]:
        recent = f" ({p['recent_problems_30d']} recent)" if p['recent_problems_30d'] > 0 else ""
        print(f"  {p['total_problems']:>4}  {p['name']}{recent}")
    print()
    print("Top 10 topics:")
    topic_sorted = sorted(topic_index.items(), key=lambda x: -x[1]['count'])[:10]
    for topic, data in topic_sorted:
        print(f"  {data['count']:>4}  {topic}")
    print()
    print(f"Output directory: {output_dir.absolute()}")
    print("=" * 60)


if __name__ == '__main__':
    main()
