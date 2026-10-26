import json
import re

transcript_path = r"C:\Users\le gonzomor\.gemini\antigravity-ide\brain\d915094e-0f3e-4a86-91f1-21733dc6108e\.system_generated\logs\transcript_full.jsonl"

known_lines = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if 'c:/Users/le%20gonzomor/Desktop/MyApp/piolo/apps/properties/models.py' in content or 'apps\\properties\\models.py' in content:
                # Look for "LineNumber: LineContent" or something like "10: class Property(models.Model):"
                # view_file outputs like "10: class Property(models.Model):"
                matches = re.findall(r'^(\d+):\s(.*)$', content, re.MULTILINE)
                for match in matches:
                    line_num = int(match[0])
                    line_content = match[1]
                    if line_num not in known_lines:
                        known_lines[line_num] = line_content
        except Exception:
            pass

with open('recovered_models.py', 'w', encoding='utf-8') as out:
    for i in sorted(known_lines.keys()):
        out.write(f"{i}: {known_lines[i]}\n")
