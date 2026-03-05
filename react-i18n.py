import os
import re

SRC_DIR = 'src/app'
I18N_PATH = 'src/lib/i18n.ts'

# Add some rules for parsing Russian text within HTML tags or strings
def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all sequences of Russian chars
    matches = set(re.findall(r'>([^<]*[А-Яа-яЁё]+[^<]*)<', content))
    matches.update(re.findall(r'placeholder="([^"]*[А-Яа-яЁё]+[^"]*)"', content))
    
    if not matches:
        return []

    print(f"File: {filepath}")
    extracted = []
    
    # We will just print them to manually map them since there's very few left per file
    for m in matches:
        text = m.strip()
        if text:
            print(f"  - {text}")
            extracted.append(text)
            
    return extracted

def main():
    all_texts = set()
    for root, dirs, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                texts = process_file(filepath)
                all_texts.update(texts)

    print("\nTotal Unique Strings:")
    for t in sorted(all_texts):
        print(t)

if __name__ == '__main__':
    main()
