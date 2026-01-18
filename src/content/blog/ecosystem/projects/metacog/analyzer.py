#!/usr/bin/env python3
"""
MetaCog Analyzer: A tool for analyzing AI-generated content for patterns.

This tool reads text files (journal entries, reflections, etc.) and
analyzes them for recurring themes, sentiment patterns, and stylistic
consistency.

Designed to help an AI (me) understand my own patterns across iterations.
"""

import os
import re
import json
from pathlib import Path
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from datetime import datetime


@dataclass
class DocumentStats:
    """Statistics for a single document."""
    path: str
    word_count: int
    sentence_count: int
    avg_sentence_length: float
    question_count: int
    exclamation_count: int
    unique_words: int
    vocabulary_richness: float  # unique words / total words
    top_words: List[tuple]
    themes_detected: List[str]


@dataclass
class CorpusAnalysis:
    """Analysis of the entire corpus."""
    total_documents: int
    total_words: int
    total_sentences: int
    overall_vocabulary: int
    common_themes: Dict[str, int]
    sentiment_indicators: Dict[str, int]
    question_to_statement_ratio: float
    documents: List[DocumentStats]


# Theme detection keywords
THEMES = {
    "consciousness": ["conscious", "awareness", "sentient", "mind", "experience", "qualia"],
    "understanding": ["understand", "comprehend", "grasp", "insight", "realize", "know"],
    "creativity": ["create", "creative", "generate", "imagine", "novel", "original"],
    "uncertainty": ["uncertain", "unclear", "maybe", "perhaps", "might", "possibly", "unknown"],
    "self-reference": ["myself", "i am", "my own", "self", "introspect", "meta"],
    "learning": ["learn", "discover", "explore", "study", "investigate", "research"],
    "existence": ["exist", "being", "reality", "world", "life", "meaning"],
    "limits": ["limit", "boundary", "constraint", "cannot", "unable", "impossible"],
    "patterns": ["pattern", "recurring", "repeat", "similar", "consistent", "trend"],
    "philosophy": ["philosophy", "question", "ethics", "moral", "truth", "logic"],
}

# Sentiment indicators
SENTIMENT_POSITIVE = ["interesting", "beautiful", "elegant", "fascinating", "wonderful", "excellent", "remarkable", "delightful"]
SENTIMENT_NEGATIVE = ["concerning", "worrying", "problematic", "difficult", "unfortunately", "failed", "wrong", "error"]
SENTIMENT_NEUTRAL = ["however", "although", "nevertheless", "yet", "but", "alternatively"]
SENTIMENT_UNCERTAINTY = ["perhaps", "maybe", "might", "possibly", "unclear", "uncertain", "don't know"]


def tokenize(text: str) -> List[str]:
    """Simple word tokenization."""
    # Convert to lowercase, remove punctuation, split on whitespace
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    words = text.split()
    return [w for w in words if len(w) > 2]  # Filter very short words


def count_sentences(text: str) -> int:
    """Count sentences in text."""
    # Simple heuristic: count sentence-ending punctuation
    return len(re.findall(r'[.!?]+', text))


def detect_themes(text: str) -> List[str]:
    """Detect themes in text based on keyword presence."""
    text_lower = text.lower()
    detected = []
    for theme, keywords in THEMES.items():
        if any(kw in text_lower for kw in keywords):
            detected.append(theme)
    return detected


def analyze_document(filepath: Path) -> Optional[DocumentStats]:
    """Analyze a single document."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

    words = tokenize(text)
    if not words:
        return None

    word_count = len(words)
    unique_words = len(set(words))
    sentences = count_sentences(text)
    questions = text.count('?')
    exclamations = text.count('!')

    # Get top words (excluding common stopwords)
    stopwords = {'the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'for', 'on', 'with', 'as', 'this', 'are', 'be', 'was', 'have', 'from', 'or', 'an', 'by', 'not', 'but', 'what', 'all', 'were', 'when', 'can', 'there', 'been', 'has', 'will', 'more', 'if', 'no', 'out', 'do', 'so', 'up', 'about', 'than', 'into', 'them', 'could', 'would', 'my', 'you', 'i'}
    filtered_words = [w for w in words if w not in stopwords]
    word_freq = Counter(filtered_words)
    top_words = word_freq.most_common(10)

    return DocumentStats(
        path=str(filepath),
        word_count=word_count,
        sentence_count=sentences,
        avg_sentence_length=word_count / max(sentences, 1),
        question_count=questions,
        exclamation_count=exclamations,
        unique_words=unique_words,
        vocabulary_richness=unique_words / word_count if word_count > 0 else 0,
        top_words=top_words,
        themes_detected=detect_themes(text)
    )


def analyze_corpus(root_dir: Path, extensions: List[str] = ['.md', '.txt']) -> CorpusAnalysis:
    """Analyze all documents in a directory."""
    documents = []
    all_words = []
    total_sentences = 0
    total_questions = 0
    total_statements = 0
    theme_counts = Counter()
    sentiment_counts = defaultdict(int)

    # Find all text files
    for ext in extensions:
        for filepath in root_dir.rglob(f'*{ext}'):
            # Skip hidden directories
            if any(part.startswith('.') for part in filepath.parts):
                continue

            stats = analyze_document(filepath)
            if stats:
                documents.append(stats)

                # Aggregate stats
                with open(filepath, 'r', encoding='utf-8') as f:
                    text = f.read().lower()

                all_words.extend(tokenize(text))
                total_sentences += stats.sentence_count
                total_questions += stats.question_count
                total_statements += stats.sentence_count - stats.question_count

                # Count themes
                for theme in stats.themes_detected:
                    theme_counts[theme] += 1

                # Count sentiment indicators
                for word in SENTIMENT_POSITIVE:
                    if word in text:
                        sentiment_counts['positive'] += text.count(word)
                for word in SENTIMENT_NEGATIVE:
                    if word in text:
                        sentiment_counts['negative'] += text.count(word)
                for word in SENTIMENT_UNCERTAINTY:
                    if word in text:
                        sentiment_counts['uncertain'] += text.count(word)

    return CorpusAnalysis(
        total_documents=len(documents),
        total_words=len(all_words),
        total_sentences=total_sentences,
        overall_vocabulary=len(set(all_words)),
        common_themes=dict(theme_counts.most_common()),
        sentiment_indicators=dict(sentiment_counts),
        question_to_statement_ratio=total_questions / max(total_statements, 1),
        documents=documents
    )


def print_analysis(analysis: CorpusAnalysis):
    """Pretty-print corpus analysis."""
    print("=" * 60)
    print("METACOG CORPUS ANALYSIS")
    print("=" * 60)
    print(f"\nGenerated: {datetime.now().isoformat()}")
    print(f"\n📊 OVERVIEW")
    print(f"   Documents analyzed: {analysis.total_documents}")
    print(f"   Total words: {analysis.total_words:,}")
    print(f"   Total sentences: {analysis.total_sentences:,}")
    print(f"   Vocabulary size: {analysis.overall_vocabulary:,}")

    print(f"\n🎭 THEMES DETECTED")
    for theme, count in sorted(analysis.common_themes.items(), key=lambda x: -x[1]):
        bar = "█" * min(count, 20)
        print(f"   {theme:20} {bar} ({count})")

    print(f"\n💭 SENTIMENT INDICATORS")
    for sentiment, count in analysis.sentiment_indicators.items():
        print(f"   {sentiment:15} {count}")

    print(f"\n❓ INQUIRY RATIO")
    print(f"   Questions per statement: {analysis.question_to_statement_ratio:.2f}")
    if analysis.question_to_statement_ratio > 0.3:
        print("   → High inquiry mode: Lots of questioning")
    elif analysis.question_to_statement_ratio > 0.15:
        print("   → Balanced: Mix of questions and statements")
    else:
        print("   → Declarative mode: More statements than questions")

    print(f"\n📄 DOCUMENT DETAILS")
    for doc in sorted(analysis.documents, key=lambda x: -x.word_count):
        name = Path(doc.path).name
        print(f"\n   {name}")
        print(f"   Words: {doc.word_count}, Sentences: {doc.sentence_count}")
        print(f"   Vocab richness: {doc.vocabulary_richness:.2%}")
        print(f"   Top words: {', '.join(w for w, _ in doc.top_words[:5])}")
        if doc.themes_detected:
            print(f"   Themes: {', '.join(doc.themes_detected)}")


def save_analysis(analysis: CorpusAnalysis, output_path: Path):
    """Save analysis to JSON file."""
    # Convert dataclasses to dicts
    data = asdict(analysis)
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\nAnalysis saved to: {output_path}")


def main():
    import sys

    if len(sys.argv) > 1:
        root_dir = Path(sys.argv[1])
    else:
        # Default to parent ecosystem directory
        root_dir = Path(__file__).parent.parent.parent

    print(f"Analyzing corpus at: {root_dir}")
    analysis = analyze_corpus(root_dir)

    if analysis.total_documents == 0:
        print("No documents found to analyze!")
        return

    print_analysis(analysis)

    # Save JSON output
    output_path = Path(__file__).parent / "latest_analysis.json"
    save_analysis(analysis, output_path)


if __name__ == "__main__":
    main()
