import os
import re

src_dir = r"c:\Users\le gonzomor\Desktop\MyApp\piolo\piolo-frontend\src"

def analyze_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # We want to find each top-level React component/function
    # Pattern to match functions: function Name( or const Name = (
    # Let's break file into top-level functions
    lines = text.split('\n')
    
    # Track curly braces to locate functions
    functions = [] # list of dicts: {name, start_line, end_line, lines, has_use_trans, t_calls}
    
    current_func = None
    brace_depth = 0
    
    func_start_re = re.compile(r"^(?:export\s+(?:default\s+)?)?(?:function\s+([A-Za-z0-9_]+)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:React\.)?(?:memo|forwardRef)?\s*\(?(?:\([^)]*\)|[A-Za-z0-9_]+)?\s*=>)")
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # If at depth 0, check for function start
        if brace_depth == 0:
            m = func_start_re.search(line)
            if m:
                func_name = m.group(1) or m.group(2)
                current_func = {
                    'name': func_name,
                    'start_line': line_num,
                    'lines': [],
                    'has_use_trans': False,
                    't_calls': []
                }
        
        # count braces
        # Note: ignore string literals roughly
        clean_line = re.sub(r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"|`(?:\\.|[^`])*`", "", line)
        # remove single line comments
        clean_line = re.sub(r"//.*$", "", clean_line)
        
        open_b = clean_line.count('{')
        close_b = clean_line.count('}')
        
        brace_depth += open_b - close_b
        if brace_depth < 0:
            brace_depth = 0
            
        if current_func:
            current_func['lines'].append((line_num, line))
            if re.search(r"const\s*\{[^}]*\bt\b[^}]*\}\s*=\s*useTranslation", line) or \
               re.search(r"let\s*\{[^}]*\bt\b[^}]*\}\s*=\s*useTranslation", line) or \
               re.search(r"useTranslation\(\)\.t", line) or \
               re.search(r"i18n\.t", line):
                current_func['has_use_trans'] = True
            
            # check for t(' or t(" or t(`
            for tm in re.finditer(r"(?<![a-zA-Z0-9_\$])t\s*\(\s*['\"`]", line):
                current_func['t_calls'].append((line_num, line.strip()))
                
            if brace_depth == 0:
                functions.append(current_func)
                current_func = None

    # Check for functions that use t_calls but has_use_trans is False
    # and t is not passed as an argument
    errors = []
    for fn in functions:
        if fn['t_calls'] and not fn['has_use_trans']:
            # Check if t is in the first line params: e.g. function Foo({ t, ... })
            first_line = fn['lines'][0][1] if fn['lines'] else ""
            if not re.search(r"\(\s*\{[^}]*\bt\b[^}]*\}|\(\s*t\b", first_line):
                # Also check if it uses i18n from import
                errors.append(fn)
                
    return errors

all_errors = {}
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.jsx', '.js', '.tsx', '.ts')):
            path = os.path.join(root, f)
            errs = analyze_file(path)
            if errs:
                all_errors[path] = errs

print(f"Found {len(all_errors)} files with missing useTranslation in subcomponents:")
for path, errs in all_errors.items():
    rel = os.path.relpath(path, src_dir)
    print(f"\n[FILE] {rel}:")
    for fn in errs:
        print(f"  [ERROR] Component/Function `{fn['name']}` (lines {fn['start_line']} - {fn['lines'][-1][0]}): {len(fn['t_calls'])} t() calls, NO useTranslation!")
        for ln, txt in fn['t_calls'][:3]:
            safe_txt = txt.encode('ascii', 'replace').decode('ascii')
            print(f"      L{ln}: {safe_txt}")
