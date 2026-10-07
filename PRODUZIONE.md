# LAIF — Decisioni tecniche e percorso verso la produzione

Documento di riferimento per portare il nuovo sito da bozza a sostituto di laifgroup.com (oggi WordPress). Raccoglie le scelte già prese, quelle da prendere e la checklist di messa online. Aggiornarlo quando una decisione cambia.

Ultimo aggiornamento: 7 ottobre 2026.

## 1. Decisioni prese

| Tema | Decisione |
| --- | --- |
| Hosting | Sito statico su Amazon S3, esposto tramite CloudFront, sul dominio `laifgroup.com` (stesso dominio del WordPress attuale). |
| Struttura | Più snella dell'attuale; le pagine definitive sono da decidere (vedi §4). |
| URL dismesse | Redirect 301 dalle vecchie URL verso la pagina più vicina. Nessuna URL indicizzata deve finire in 404. |
| Lingue | Contenuti in italiano e inglese, con URL separate (`/en/...`). |
| Form | Form collegati a un tool di automazione ancora da scegliere. Il sito resta statico: il form invia a un webhook/endpoint del tool. |
| Dipendenze | Nessun framework o build obbligatoria, salvo decisione esplicita. |

## 2. Infrastruttura AWS

Stato rilevato il 7/10/2026: DNS già su Route 53 (nameserver `awsdns`); il record A punta all'hosting WordPress attuale (nginx); la posta è su Microsoft 365 (record MX `*.mail.protection.outlook.com`). **I record MX e quelli della posta non vanno toccati.**

Architettura prevista:

- **S3** — bucket privato, *Block Public Access* attivo, senza "static website hosting". Accesso solo da CloudFront tramite Origin Access Control (OAC).
- **ACM** — certificato in `us-east-1` per `laifgroup.com` e `www.laifgroup.com`.
- **CloudFront** — HTTPS obbligatorio, HTTP/2 e HTTP/3, compressione, `index.html` come default root object.
- **CloudFront Function (viewer request)**:
  - riscrive `/percorso/` in `/percorso/index.html` (S3 via OAC non risolve le directory);
  - applica la mappa dei redirect 301;
  - porta `www.laifgroup.com` su `laifgroup.com` con 301;
  - normalizza lo slash finale come su WordPress (URL con `/` finale).
- **Response headers policy** — HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy` coerente con il tool dei form.
- **Pagina 404** — `404.html` servita con stato 404 reale (non 200).
- **Caching** — HTML con TTL breve, CSS/JS/immagini con TTL lungo e nomi versionati; invalidazione a ogni deploy.
- **Log** — log di accesso CloudFront attivi per monitorare i 404 dopo il passaggio.
- **Infrastruttura come codice** — CloudFormation o Terraform nel repo, da decidere.
- **Deploy** — si pubblica solo il contenuto di `site/` nella radice del bucket. L'`index.html` della radice del repo (redirect per GitHub Pages) non va pubblicato.

## 3. SEO tecnica

Requisiti per non perdere il posizionamento del sito attuale:

- Rimuovere `noindex,nofollow` **solo** sul sito di produzione, al momento del passaggio. Gli ambienti di staging restano `noindex`.
- `<link rel="canonical">` assoluto su ogni pagina.
- `hreflang` IT/EN reciproci + `x-default` (oggi WordPress usa `x-default` → `/`).
- `sitemap.xml` con tutte le pagine indicizzabili, `lastmod` reale e alternative linguistiche; dichiarata in `robots.txt` e inviata a Search Console.
- Title e meta description per ogni pagina. Template proposto per le pagine core: `{Soluzione}: {beneficio concreto} | LAIF`, entro 60 caratteri; meta description di 140–155 caratteri.
- Open Graph e Twitter card per la condivisione.
- Un solo `<h1>` per pagina; contenuti principali presenti nell'HTML, non generati da JavaScript.
- Privacy policy e cookie policy sempre online (obbligo legale), possibilmente alle URL attuali `/privacy-policy/` e `/cookies/`.

## 4. Struttura URL proposta (da validare)

Riusare i percorsi esistenti dove possibile, per ridurre i redirect.

| IT | EN | Note |
| --- | --- | --- |
| `/` | `/en/` | invariate |
| `/soluzioni/<slug>/` | `/en/solutions/<slug>/` | stesso prefisso di oggi; le soluzioni eliminate vanno in 301 |
| `/settori/<slug>/` | `/en/industries/<slug>/` | da decidere se sostituisce `/ambiti-di-applicazione/` (che oggi descrive funzioni aziendali, non settori) |
| `/progetti/<slug>/` | `/en/projects/<slug>/` | case study reali e autorizzati |
| `/chi-siamo/` | `/en/about/` | scheda dati aziendale: fonte di riferimento per motori e LLM (§5) |
| `/lavora-con-noi/` | `/en/work-with-us/` | invariate |
| `/blog/<slug>/` | `/en/blog/<slug>/` | piano contenuti da definire |
| `/privacy-policy/`, `/cookies/` | — | invariate |

## 5. GEO / AI visibility

Obiettivo: LAIF e Helia facilmente trovabili e rappresentati correttamente nelle risposte dei modelli (Gemini, ChatGPT, Perplexity, Claude), anche per domande come "quanti dipendenti ha LAIF?" o "che progetti fa LAIF?".

Principi:

- **Gemini attinge all'indice di Google.** La base resta la SEO classica: pagine indicizzabili con testo nell'HTML. Un sito statico è il caso ideale.
- **Fatti in frasi esplicite e datate**, nella forma soggetto → attributo → valore. Esempio di formato (valori da compilare con dati verificati):
  > "LAIF è una software house italiana con sede a [città], fondata nel [anno]. A [mese anno] il team conta [N] persone."

  Evitare informazioni affidate solo a titoli rotanti in JavaScript, immagini, SVG o formule vaghe ("un team giovane e dinamico").
- **Scheda dati in `/chi-siamo/` e `/en/about/`**: ragione sociale, P.IVA, sede, anno di fondazione, numero di persone con data di aggiornamento, servizi, settori, elenco progetti con link ai case study, rapporto LAIF–Helia ed eventuali altre società collegate.
- **FAQ che rispondono letteralmente alle domande target** (es. "Quante persone lavorano in LAIF?", "Che progetti realizza LAIF?", "Che differenza c'è tra LAIF e Helia?").
- **Case study strutturati**, con URL stabile: settore, problema, soluzione, tecnologie, risultati verificati. Concept e progetti reali sempre distinti.
- **Dati strutturati JSON-LD**, coerenti con il testo visibile:
  - `Organization`: `name`, `legalName`, `url`, `logo`, `foundingDate`, `numberOfEmployees` (`QuantitativeValue`), `address`, `sameAs` (LinkedIn, Wikidata, Crunchbase…), relazione con Helia (`subOrganization` / `parentOrganization`);
  - `WebSite`, `BreadcrumbList`;
  - `Service` per ogni soluzione;
  - `FAQPage` per le FAQ;
  - `Article` per case study e blog.
- **Data di aggiornamento visibile** nelle pagine con fatti e `lastmod` corrispondente nella sitemap.
- **robots.txt**: non bloccare `Google-Extended` (controlla anche l'uso dei contenuti nelle risposte delle app Gemini). Lasciare aperti `OAI-SearchBot`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, salvo decisione diversa.
- **`llms.txt`**: opzionale e a basso costo; letto da alcuni crawler, ma Google ha dichiarato di non usarlo. Non è una leva per Gemini.

### Coerenza delle fonti esterne (audit citabilità)

I modelli incrociano più fonti: numeri discordanti producono risposte vaghe o sbagliate. Stesso numero di persone, stessa descrizione e stesso rapporto LAIF–Helia su:

- LinkedIn (pagina aziendale e fascia dipendenti)
- Google Business Profile
- Registro Imprese / Atoka
- Crunchbase
- Wikidata (molto usato dai modelli; creabile e mantenibile direttamente)
- Directory di settore (Clutch, GoodFirms…)
- Articoli stampa, pagine di partner e clienti

Da ripetere anche per Helia.

### Misurazione

- Set fisso di query target (IT/EN) da provare ogni mese su Gemini, ChatGPT, Perplexity e Claude, annotando correttezza e fonti citate.
- Search Console per indicizzazione, query e pagine.

## 6. Piano SEO (bucket di lavoro)

- [ ] Keyword set (head + long tail) per le pagine core — richiede Search Console e un tool con volumi (Keyword Planner, Semrush o simili); nessun volume va stimato a mano.
- [ ] Struttura URL e naming pagine (settori/soluzioni) — base in §4.
- [ ] Title/meta template per pagine core — base in §3.
- [ ] Piano contenuti blog (titoli placeholder).
- [ ] AI visibility / LLM SEO: set di query target + contenuti "source of truth" (FAQ, use case, pagine prodotto).
- [ ] Audit citabilità: quali fonti esterne devono parlare di noi e con quale wording.
- [ ] GEO: LAIF e Helia trovabili e rappresentati correttamente su keyword come "software house Italia", "AI per aziende" e simili.

## 7. Cosa serve per andare in produzione

### Contenuti e dati (dal team)

- [ ] Struttura definitiva delle pagine e degli slug IT/EN.
- [ ] Dati aziendali verificati: ragione sociale, P.IVA, sede, anno di fondazione, numero di persone con data.
- [ ] Rapporto LAIF–Helia (e Searchbridge, Dinamo, Jubatus) verificato; dominio di Helia.
- [ ] Case study reali con autorizzazione dei clienti, al posto dei concept.
- [ ] Foto e video reali del team.
- [ ] Copy validato in italiano e inglese.
- [ ] Logo, palette e font allineati alle brand guidelines.
- [ ] Recapiti, dati societari nel footer, privacy policy e cookie policy aggiornate.
- [ ] Rimozione delle note di bozza solo dopo la sostituzione con contenuti verificati.

### Sito

- [ ] Menu e CTA cliccabili, pagine collegate.
- [ ] Versione inglese con hreflang.
- [ ] Form collegati al tool di automazione scelto; pagine di conferma; informativa privacy accanto al form.
- [ ] Banner cookie solo se il tool dei form o altri servizi installano cookie non tecnici.
- [ ] Meta, canonical, Open Graph, JSON-LD su tutte le pagine.
- [ ] `robots.txt`, `sitemap.xml`, `404.html`.
- [ ] Verifica accessibilità (tastiera, etichette, movimento ridotto) e resa desktop/mobile.
- [ ] Performance: immagini ottimizzate (AVIF/WebP, dimensioni esplicite), font locali.

### Migrazione dal WordPress

- [ ] Backup completo di WordPress (file + database) prima di qualsiasi modifica.
- [ ] Export da Search Console: pagine e query con più clic, pagine con più link in entrata.
- [ ] Mappa redirect 301 completa (Appendice A) con destinazione per ogni URL.
- [ ] Script di verifica: ogni vecchia URL risponde 301 → 200 sulla destinazione corretta, senza catene.

### Infrastruttura e passaggio

- [ ] Bucket, OAC, certificato ACM, distribuzione CloudFront, function e header (§2), come codice.
- [ ] Staging su sottodominio con `noindex`; test completo di redirect, form, 404, header.
- [ ] TTL dei record DNS ridotto con anticipo.
- [ ] Switch del record A/AAAA (alias) di `laifgroup.com` e `www` verso CloudFront. MX invariati.
- [ ] Rimozione del `noindex` in produzione.
- [ ] WordPress mantenuto su un sottodominio interno non indicizzato per alcune settimane come rollback.
- [ ] Invio della nuova sitemap a Search Console; controllo copertura e 404 nei log per 4–6 settimane.

### Approvazioni

Push, Pull Request, deploy, modifiche DNS e pubblicazione richiedono approvazione esplicita sul pacchetto concreto, come indicato in `AGENTS.md`.

## Appendice A — URL attuali da mappare

Rilevate dalla sitemap pubblica di laifgroup.com (All in One SEO) il 7/10/2026. La colonna destinazione si compila quando la nuova struttura è decisa.

| URL attuale | Destinazione |
| --- | --- |
| `/` | `/` |
| `/en/` | `/en/` |
| `/principi/` | da decidere |
| `/en/principles/` | da decidere |
| `/lavora-con-noi/` | `/lavora-con-noi/` |
| `/en/work-with-us/` | `/en/work-with-us/` |
| `/privacy-policy/` | `/privacy-policy/` |
| `/cookies/` | `/cookies/` |
| `/soluzioni/sistemi-previsionali/` | da decidere |
| `/soluzioni/recupero-credito/` | da decidere |
| `/soluzioni/raccomandazioni-commerciali/` | da decidere |
| `/soluzioni/ottimizzazione-risorse/` | da decidere |
| `/soluzioni/gestione-documentale/` | da decidere |
| `/soluzioni/clustering/` | da decidere |
| `/soluzioni/chatbot-generativo/` | da decidere |
| `/soluzioni/anomaly-detection/` | da decidere |
| `/en/solutions/forecasting-systems/` | da decidere |
| `/en/solutions/debt-recovery/` | da decidere |
| `/en/solutions/business-recommendations/` | da decidere |
| `/en/solutions/resource-optimization/` | da decidere |
| `/en/solutions/document-management/` | da decidere |
| `/en/solutions/clustering/` | da decidere |
| `/en/solutions/chatbot/` | da decidere |
| `/en/solutions/anomaly-detection/` | da decidere |
| `/ambiti-di-applicazione/supply-chain-logistica/` | da decidere |
| `/ambiti-di-applicazione/produzione/` | da decidere |
| `/ambiti-di-applicazione/marketing-sales/` | da decidere |
| `/ambiti-di-applicazione/hr/` | da decidere |
| `/ambiti-di-applicazione/amministrazione/` | da decidere |
| `/en/applications/` | da decidere |
| `/en/applications/supply-chain-logistics/` | da decidere |
| `/en/applications/production/` | da decidere |
| `/en/applications/marketing-sales/` | da decidere |
| `/en/applications/hr/` | da decidere |
| `/en/applications/administration/` | da decidere |
| `/landing-chatbot/` | da decidere |
| `/ia-e-pmi-tecnologia-finanza-e-comunicazione-a-confronto/` | da decidere |
| `/grazie/`, `/grazie-work/`, `/grazie-evento/`, `/thank-you-chatbot/` | nuove pagine di conferma o `/` |
| `/en/grazie/`, `/en/thank-you-work/` | nuove pagine di conferma o `/en/` |
| `/hello-world/`, `/sample-page/`, `/en/category/non-categorizzato/` | `/` (contenuti di default WordPress) |
| `/blocks/*`, `/en/blocks/*` | `/` o 410 (blocchi interni del tema, non dovrebbero essere indicizzati) |

Prima del passaggio, integrare con le URL presenti in Search Console ma assenti dalla sitemap (es. `/sitemap.rss`, allegati, vecchi articoli).
