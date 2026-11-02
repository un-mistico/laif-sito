"""Estrae i testi italiani del sito e costruisce la versione inglese in site/en/.

  python3 tools/i18n.py extract   -> tools/i18n/strings.json  (testi italiani da tradurre)
  python3 tools/i18n.py build     -> site/en/...              (usa tools/i18n/en.json)

Unità di traduzione: il contenuto interno dei blocchi di testo (titoli, paragrafi, voci
di elenco, pulsanti...) con il markup inline incluso; poi i testi rimasti fuori dai
blocchi e gli attributi leggibili (alt, title, aria-label, placeholder, meta).
"""
import json, os, re, sys, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
DATA = ROOT / 'tools' / 'i18n'
SKIP_DIRS = {'en', 'assets', 'privacy-policy', 'cookie-policy'}
BLOCK = r'(h[1-6]|p|li|blockquote|summary|figcaption|dt|dd|label|legend|td|th|button|title)'
NESTED = re.compile(r'<(h[1-6]|p|li|blockquote|div|section|ul|ol|table|figure|article|nav|header|footer|main|aside|iframe|button)\b', re.I)
SEG = re.compile(r'<' + BLOCK + r'(\s[^>]*)?>(.*?)</\1>', re.S | re.I)
ATTR = re.compile(r'\b(alt|title|aria-label|placeholder)="([^"]*)"')
META = re.compile(r'(<meta (?:name="description"|property="og:(?:title|description)") content=")([^"]*)(")')
SKIP_BLOCKS = re.compile(r'(?s)<(script|style|svg|iframe)\b.*?</\1>')


def pages():
    for p in sorted(SITE.rglob('index.html')):
        rel = p.relative_to(SITE)
        if rel.parts[0] in SKIP_DIRS:
            continue
        s = p.read_text()
        if 'http-equiv="refresh"' in s:
            yield rel, s, True
        else:
            yield rel, s, False


def worth(t):
    t = html.unescape(re.sub(r'<[^>]+>|\x00[A-Z]\d+\x00', '', t)).strip()
    return bool(t) and bool(re.search(r'[A-Za-zÀ-ÿ]', t))


def protect(s):
    """Sostituisce script/style/svg/iframe con segnaposto, per non toccarli."""
    keep = []
    def put(m):
        keep.append(m.group(0)); return f'\x00K{len(keep)-1}\x00'
    return SKIP_BLOCKS.sub(put, s), keep


def restore(s, keep):
    return re.sub(r'\x00K(\d+)\x00', lambda m: keep[int(m.group(1))], s)


def walk(s, fn):
    """Applica fn ai testi della pagina e restituisce la pagina trasformata."""
    s, keep = protect(s)
    segs = []
    def seg(m):
        inner = m.group(3)
        if NESTED.search(inner) or not worth(inner):
            return m.group(0)
        segs.append(fn(inner))
        return m.group(0)[:m.start(3) - m.start()] + f'\x00S{len(segs)-1}\x00' + m.group(0)[m.end(3) - m.start():]
    # ripete finché trova blocchi foglia (gestisce l'annidamento)
    prev = None
    while prev != s:
        prev = s; s = SEG.sub(seg, s)
    # testi residui fuori dai blocchi
    def txt(m):
        t = m.group(1)
        if not worth(t) or '\x00' in t:
            return m.group(0)
        lead = t[:len(t) - len(t.lstrip())]; trail = t[len(t.rstrip()):]
        return '>' + lead + fn(t.strip()) + trail + '<'
    s = re.sub(r'>([^<>]+)<', txt, s)
    s = ATTR.sub(lambda m: f'{m.group(1)}="{fn(m.group(2))}"' if worth(m.group(2)) else m.group(0), s)
    s = META.sub(lambda m: m.group(1) + fn(m.group(2)) + m.group(3) if worth(m.group(2)) else m.group(0), s)
    s = re.sub(r'\x00S(\d+)\x00', lambda m: segs[int(m.group(1))], s)
    return restore(s, keep)


def extract():
    found = {}
    for rel, s, redirect in pages():
        if redirect:
            continue
        walk(s, lambda t: found.setdefault(t, t) or t)
    script = (SITE / 'script.js').read_text()
    for m in re.finditer(r"'((?:[^'\\]|\\.)*?)'", script):
        t = m.group(1)
        if re.search(r'[a-zà-ù]{3,} [a-zà-ù]{2,}', t) or re.match(r'^[A-ZÀ-Ü][a-zà-ù]+[ .,!?…]', t):
            if not re.search(r'[{}();=]|querySelector|https?:', t):
                found.setdefault(t, t)
    DATA.mkdir(parents=True, exist_ok=True)
    json.dump(found, open(DATA / 'strings.json', 'w'), ensure_ascii=False, indent=0)
    print(len(found), 'strings,', sum(len(k) for k in found), 'chars')


SHARED = {'assets', 'styles.css', 'script.js', 'privacy-policy', 'cookie-policy'}
URL = re.compile(r'\b(href|src|poster|data-src|url)=("?)([^"\s>;]+)')


def shift(s, rel):
    """Le pagine in en/ stanno un livello più in basso: sposta i rimandi alle risorse condivise."""
    base = list(rel.parent.parts)
    def fix(m):
        u = m.group(3)
        if re.match(r'^(?:[a-z]+:|#|//)', u):
            return m.group(0)
        parts = base[:]
        for seg in u.split('?')[0].split('#')[0].split('/'):
            if seg == '..':
                parts = parts[:-1]
            elif seg and seg != '.':
                parts.append(seg)
        if parts and parts[0] in SHARED:
            u = '../' + u
        return f'{m.group(1)}={m.group(2)}{u.replace("script.js", "script.en.js")}'
    return URL.sub(fix, s)


def switcher(s, rel, lang):
    up = '../' * (len(rel.parts) - 1)
    if lang == 'it':
        other, label, alt = f'{up}en/{rel.as_posix()}', 'EN', 'en'
    else:
        other, label, alt = f'../{up}{rel.as_posix()}', 'IT', 'it'
    s = re.sub(r'<link rel="alternate" hreflang=[^>]*>', '', s)
    s = re.sub(r'<a class="lang-switch"[^>]*>[^<]*</a>', '', s)
    here = rel.name
    alts = {lang: here, alt: other}
    links = ''.join(f'<link rel="alternate" hreflang="{k}" href="{v}">' for k, v in sorted(alts.items()))
    s = s.replace('</head>', links + '</head>', 1)
    link = f'<a class="lang-switch" href="{other}" hreflang="{alt}" lang="{alt}" aria-label="{"English version" if alt == "en" else "Versione italiana"}">{label}</a>'
    return s.replace('<a class="cta header-cta"', link + '<a class="cta header-cta"', 1)


def translate_js(js, tr):
    def lit(m):
        t = m.group(1)
        if '<' in t or '>' in t:
            wrapped = not t.startswith('<')
            out = walk('>' + t + '<' if wrapped else t, tr)
            return "'" + (out[1:-1] if wrapped else out) + "'"
        # gli identificativi (valori dei radio, nomi degli step) restano come sono
        return "'" + (tr(t) if ' ' in t or t[:1].isupper() else t) + "'"
    return re.sub(r"'((?:[^'\\\n]|\\.)*)'", lit, js)


def build():
    en = {}
    for f in sorted(DATA.glob('en*.json')):
        en.update(json.load(open(f)))
    miss = set()
    def tr(t):
        if t in en:
            return en[t]
        if worth(t) and re.search(r'[a-zà-ù]{3}', t):
            miss.add(t)
        return t
    out_root = SITE / 'en'
    for rel, s, redirect in pages():
        page = walk(s, tr)
        page = shift(page, rel)
        page = page.replace('<html lang="it"', '<html lang="en"', 1).replace('content="it_IT"', 'content="en_GB"')
        dest = out_root / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not redirect:
            page = switcher(page, rel, 'en')
            (SITE / rel).write_text(switcher(s, rel, 'it'))
        dest.write_text(page)
    js = (SITE / 'script.js').read_text()
    (SITE / 'script.en.js').write_text(translate_js(js, lambda t: en.get(t, t)))
    json.dump(sorted(miss), open(DATA / 'missing.json', 'w'), ensure_ascii=False, indent=0)
    print('pages built; untranslated:', len(miss))


if __name__ == '__main__':
    {'extract': extract, 'build': build}[sys.argv[1]]()
