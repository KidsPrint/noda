#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сборка продакшен-версии сайта: site/ -> dist/ с минификацией наших ассетов.
Файлы Next.js уже минифицированы и копируются как есть.
Использование: python3 scripts/build_dist.py [--zip out.zip]
"""
import os, re, shutil, subprocess, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
DIST = os.path.join(ROOT, 'dist')

# наши (не-Next) ассеты, которые минифицируем esbuild'ом
ESBUILD_TARGETS = [
    'custom/upgrade.js',
    'custom/upgrade.css',
    'custom/lead-config.js',
    'custom/gate.js',
    'blog/blog.css',
    'blog/articles.js',
    'blog/views.js',
]

def html_targets():
    """Наши html-страницы (безопасное сжатие пробелов вне <script>/<pre>)."""
    rels = ['404.html', '404/index.html', 'blog/index.html']
    for p in glob.glob(os.path.join(DIST, 'blog', '*', 'index.html')):
        rels.append(os.path.relpath(p, DIST))
    return rels


def minify_html(html):
    """Схлопывает пробелы/переносы между тегами, не трогая <script>, <style>, <pre>."""
    parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>|<pre\b.*?</pre>)',
                     html, flags=re.S | re.I)
    out = []
    for i, part in enumerate(parts):
        if i % 2 == 1:  # защищённый блок
            out.append(part)
        else:
            part = re.sub(r'<!--(?!\[).*?-->', '', part, flags=re.S)  # комментарии
            part = re.sub(r'>\s+<', '><', part)
            part = re.sub(r'\s{2,}', ' ', part)
            out.append(part.strip('\n'))
    return ''.join(out)


def main():
    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    shutil.copytree(SITE, DIST)

    for rel in ESBUILD_TARGETS:
        src = os.path.join(DIST, rel)
        if not os.path.exists(src):
            print('skip (missing):', rel)
            continue
        before = os.path.getsize(src)
        subprocess.run(['npx', 'esbuild', src, '--minify', '--charset=utf8',
                        '--outfile=' + src, '--allow-overwrite', '--log-level=error'],
                       check=True, cwd=ROOT)
        print(f'esbuild {rel}: {before} -> {os.path.getsize(src)} bytes')

    for rel in sorted(set(html_targets())):
        src = os.path.join(DIST, rel)
        if not os.path.exists(src):
            continue
        with open(src, encoding='utf-8') as f:
            html = f.read()
        before = len(html.encode('utf-8'))
        html = minify_html(html)
        with open(src, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'html {rel}: {before} -> {len(html.encode("utf-8"))} bytes')

    if '--zip' in sys.argv:
        out = sys.argv[sys.argv.index('--zip') + 1]
        if os.path.exists(out):
            os.remove(out)
        subprocess.run(['zip', '-r', '-q', os.path.abspath(out), '.'], check=True, cwd=DIST)
        print('archive:', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
