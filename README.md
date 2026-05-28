# Simple calc app

Tato jednoduchá kalkulačka je vytvořena s pomocí AI a to Claude.

Můj postup:

1. Nechal jsem si vygenerovat aplikaci kalkulačky, tak aby byla responzivní a dala se ovládat myší i klávesnicí. Zvolil jsem vite a čistý css, protože mi pro takto malý projekt dává největší smysl a i kvůli nasazení na Vercel.
2. Prošel jsem kód, abych věděl, co vše je potřeba zlepšit.
3. Potřeboval jsem zlepšit logiku (např. hlášení chyby, pokud dělím nulou, pokud mám 8+5 a dám 2x rovná se, tak znovu přičte pět), přístupnost, popisky a členění kódu, aby byl kód co nejjednodušeji do budoucna upravovatelný.
4. Finálně jsem si udělal testy: ts, eslint, prettier a vitest. Faviconu jsem neřešil, protože mi přišla dobrá ta od vite.
5. Deploy na Github a na Vercel.

Github: https://github.com/Gozo18/calc
Vercel: https://calc-umber-nine.vercel.app/
