# LAIF — Nuovo sito

Spazio di lavoro per sviluppare insieme la homepage LAIF, anche con assistenti AI diversi.

## Vedere subito la homepage

Scarica il progetto e apri `site/index.html` nel browser. Mantieni i tre file della cartella `site` insieme.

Per usare un server locale, dalla cartella principale:

```sh
python3 -m http.server 3000 --bind 127.0.0.1 --directory site
```

Apri http://127.0.0.1:3000. Aggiorna la pagina dopo ogni modifica. Non sono richieste installazioni di librerie.

## Lavorare dal browser con GitHub Codespaces

1. Su GitHub apri **Code → Codespaces → Create codespace on main**.
2. Attendi la preparazione dell'ambiente.
3. Nel menu **Terminal → Run Task**, scegli **LAIF: avvia anteprima**. In alternativa, usa il comando qui sopra nel terminale.
4. Nella scheda **Ports**, apri la porta **3000** nel browser. Mantieni la visibilità **Private**.
5. Aggiorna l'anteprima dopo aver salvato le modifiche.
6. Quando hai finito, arresta il Codespace dal menu di GitHub: chiudere la scheda non equivale necessariamente a fermarlo.

Codespaces è opzionale e ha quote e fatturazione proprie. Questa configurazione non lo avvia e non attiva abbonamenti. Ogni persona può lavorare anche dal proprio computer usando il proprio assistente AI.

## Collaborare in tre

`main` conserva la versione condivisa. Per ogni proposta crea un branch dedicato, ad esempio `matteo/hero`, `collega/progetti` o `collega/team`. Sono esempi, non account reali.

1. Parti dall'ultima versione di `main`.
2. Scegli una modifica circoscritta e scrivi al team su quale sezione lavori.
3. Lavora nel tuo branch con l'assistente che preferisci.
4. Controlla la homepage nel browser, anche su mobile.
5. Apri una **Pull Request**: è la proposta di modifica, con descrizione e verifica.
6. Un'altra persona rivede il risultato. Integrate la proposta in `main` quando siete d'accordo.

Evita che due agenti riscrivano contemporaneamente l'intera pagina. Se le modifiche toccano lo stesso testo o stile, confrontate e risolvete le differenze prima di unire il lavoro. Il modello per le Pull Request è incluso.

## Dove modificare

| File | Contenuto |
| --- | --- |
| `site/index.html` | Testi, sezioni, menu, illustrazione del computer |
| `site/styles.css` | Colori, font, layout, adattamento mobile, transizioni |
| `site/script.js` | Rotazione del titolo, fasi del computer, pausa animazioni |
| `NOTE-DESIGN.md` | Scelte della bozza e contenuti da completare |
| `AGENTS.md` | Istruzioni comuni per chi usa un agente AI |

## Prompt di partenza per il proprio assistente

> Leggi AGENTS.md e NOTE-DESIGN.md. Lavora su una proposta separata dalla versione principale. Modifica solo [sezione] per ottenere [risultato]. Conserva menu statico, scrollytelling, adattamento mobile e accessibilità. Verifica il risultato nel browser e riepiloga cosa è cambiato. Prima di inviare contenuti a GitHub, mostra la proposta finale e attendi approvazione esplicita.

## Anteprima condivisa del team

La homepage è pubblicata su GitHub Pages: https://un-mistico.github.io/laif-sito/

Le modifiche integrate nel branch `main` aggiornano automaticamente il sito dopo il completamento della pubblicazione. I file da modificare sono nella cartella `site`; il file `index.html` nella radice porta alla homepage. Non occorre un backend o un account Vercel.

Per aggiungere i colleghi, il proprietario apre https://github.com/un-mistico/laif-sito/settings/access e usa **Add people**. Ogni collega deve accettare il proprio invito.

Le Pull Request non generano anteprime pubbliche separate: per rivederle usa l’anteprima locale o il Codespace.

## Stato della bozza

Menu e contatto non cliccabili. Attivi: collegamento al metodo, navigazione delle fasi, animazioni e FAQ. Foto del team e case study sono da completare con materiali reali. Nessun tracking, form o dipendenza esterna. Il sito ha `noindex,nofollow`, che non costituisce un controllo di accesso.

Il progetto include solo la homepage e la documentazione di lavoro. Non include transcript integrali, archivio originale, credenziali o documenti di altri progetti. Non è concessa una licenza open source.
