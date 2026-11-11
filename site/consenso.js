/*
 * Banner cookie di LAIF: sostituisce Cookiebot.
 *
 * Cosa fa, e perché (Garante privacy, linee guida cookie del 10 giugno 2021; art. 7 GDPR):
 * - nessuno script di statistica o marketing, e nessun contenuto di terze parti, parte prima del consenso:
 *   Google Analytics, Clarity, Meta Pixel e LinkedIn Insight Tag li carica questo file, per categoria;
 * - «Rifiuta tutti» ha lo stesso peso di «Accetta tutti», e chiudere con la X vale come rifiuto;
 * - scelta per categoria (Personalizza), sempre modificabile da «Preferenze cookie» nel footer;
 * - ogni scelta finisce nel registro dei consensi (Wolico, `POST /public/consensi`) con un ID che il
 *   visitatore vede nelle preferenze: è la prova del consenso che prima teneva Cookiebot;
 * - la scelta vale 6 mesi, o finché non cambia la versione della cookie policy; poi il banner torna;
 * - se il consenso viene tolto, si cancellano i cookie del sito di quella categoria e la pagina si ricarica;
 * - Google riceve i segnali del Consent Mode v2, Clarity quelli della sua Consent API.
 *
 * I post di LinkedIn e i video di YouTube incorporati arrivano con `data-consenso-src` al posto di `src`:
 * finché non c'è il consenso al marketing, al loro posto c'è un riquadro che lo chiede.
 */
(function () {
  'use strict';

  var CONFIG = window.LAIF_CONSENSO_CONFIG || {};
  var VERSIONE = CONFIG.versione || '2026-11-11';
  var DURATA_GIORNI = 182;
  var COOKIE = 'laif_consenso';
  var SERVIZI = {
    ga4: CONFIG.ga4 || 'G-XHT0X5PW1D',
    clarity: CONFIG.clarity || 'tise4s5k2i',
    metaPixel: CONFIG.metaPixel || '871017535099664',
    linkedin: CONFIG.linkedin || ['8774649', '9325729']
  };
  // In prova gli script dei servizi non partono davvero: si vede quale partirebbe, senza mandare
  // dati agli account veri di Google, Microsoft, Meta e LinkedIn (finché il sito non è su laifgroup.com).
  var PROVA = !!CONFIG.prova;

  var en = (document.documentElement.lang || 'it').toLowerCase().indexOf('en') === 0;
  var T = en ? {
    titolo: 'This website uses cookies',
    testo: 'We use technical cookies, which the website needs to work. With your consent we also use statistics cookies (Google Analytics, Microsoft Clarity) to understand how the website is used, and marketing cookies (Meta, LinkedIn, embedded LinkedIn and YouTube content) to measure our campaigns and show you ads in line with your interests. Closing this box with the X rejects the optional cookies. You can change your mind at any time from “Cookie preferences” at the bottom of every page.',
    policy: 'Cookie policy',
    rifiuta: 'Reject all', accetta: 'Accept all', personalizza: 'Customise', salva: 'Save my choices',
    chiudi: 'Close and reject optional cookies', chiudiPref: 'Close',
    prefTitolo: 'Cookie preferences',
    prefTesto: 'Choose which cookies to allow. You can change these choices at any time.',
    sempre: 'Always active', servizi: 'Services', elenco: 'Full list of cookies',
    stato: 'Your consent: ID {id}, given on {data}.', nessuno: 'You have not made a choice yet.',
    embed: 'This content is hosted by {servizio}, which uses marketing cookies.',
    embedAccetta: 'Accept marketing cookies and show it', embedApri: 'Open on {servizio}'
  } : {
    titolo: 'Questo sito usa i cookie',
    testo: 'Usiamo cookie tecnici, necessari al funzionamento del sito. Con il tuo consenso usiamo anche cookie di statistica (Google Analytics, Microsoft Clarity) per capire come viene usato il sito, e cookie di marketing (Meta, LinkedIn, post di LinkedIn e video di YouTube incorporati) per misurare le nostre campagne e mostrarti annunci in linea con i tuoi interessi. Chiudendo con la X rifiuti i cookie non necessari. Puoi cambiare idea in ogni momento da «Preferenze cookie», in fondo a ogni pagina.',
    policy: 'Cookie policy',
    rifiuta: 'Rifiuta tutti', accetta: 'Accetta tutti', personalizza: 'Personalizza', salva: 'Salva le scelte',
    chiudi: 'Chiudi e rifiuta i cookie non necessari', chiudiPref: 'Chiudi',
    prefTitolo: 'Preferenze cookie',
    prefTesto: 'Scegli quali cookie permettere. Puoi cambiare queste scelte in ogni momento.',
    sempre: 'Sempre attivi', servizi: 'Servizi', elenco: 'Elenco completo dei cookie',
    stato: 'Il tuo consenso: ID {id}, del {data}.', nessuno: 'Non hai ancora fatto una scelta.',
    embed: 'Questo contenuto è ospitato da {servizio}, che usa cookie di marketing.',
    embedAccetta: 'Accetta i cookie di marketing e mostralo', embedApri: 'Apri su {servizio}'
  };
  var CATEGORIE = [
    { id: 'necessari', nome: en ? 'Necessary' : 'Necessari', fissa: true, servizi: 'LAIF',
      testo: en ? 'They make the website work and remember your cookie choice.' : 'Fanno funzionare il sito e ricordano la tua scelta sui cookie.' },
    { id: 'statistiche', nome: en ? 'Statistics' : 'Statistiche', servizi: 'Google Analytics, Microsoft Clarity',
      testo: en ? 'How many people visit the website, where they come from and how they use it. Clarity also records clicks and scrolling.'
        : 'Quante persone visitano il sito, da dove arrivano e come lo usano. Clarity registra anche clic e scorrimento della pagina.' },
    { id: 'marketing', nome: 'Marketing', servizi: 'Meta Pixel, LinkedIn Insight Tag, LinkedIn, YouTube',
      testo: en ? 'They measure our campaigns and allow ads in line with your interests. They include embedded LinkedIn posts and YouTube videos.'
        : 'Misurano le nostre campagne e permettono annunci in linea con i tuoi interessi. Comprendono i post di LinkedIn e i video di YouTube incorporati.' }
  ];

  // ── Stato del consenso ────────────────────────────────────────────────────

  function leggi() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    if (!m) return null;
    try {
      var c = JSON.parse(decodeURIComponent(m[1]));
      return c && c.v === VERSIONE ? c : null;
    } catch (e) { return null; }
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function salva(scelte, metodo) {
    var prima = leggi();
    var c = { id: uuid(), v: VERSIONE, t: new Date().toISOString(), s: !!scelte.statistiche, m: !!scelte.marketing };
    var scade = new Date(Date.now() + DURATA_GIORNI * 864e5).toUTCString();
    document.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(c)) + '; expires=' + scade + '; path=/; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
    registra(c, metodo);
    var tolto = prima && ((prima.s && !c.s) || (prima.m && !c.m));
    if (tolto) {
      cancellaTraccia(prima.s && !c.s, prima.m && !c.m);
      location.reload();
      return c;
    }
    applica(c);
    return c;
  }

  // Un beacon e basta: JSON in text/plain, senza cookie né preflight, e la risposta non si legge.
  // Così il sito non ha bisogno di nessun permesso CORS su Wolico, e la scelta arriva anche se la
  // pagina si sta ricaricando (revoca). Wolico controlla l'Origin, la pagina e i campi.
  function registra(c, metodo) {
    if (!CONFIG.registro) return;
    var corpo = JSON.stringify({ id: c.id, versione: c.v, metodo: metodo, statistiche: c.s, marketing: c.m,
      url: location.href.split('#')[0].slice(0, 2048), lingua: en ? 'en' : 'it' });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(CONFIG.registro, corpo)) return;
      fetch(CONFIG.registro, { method: 'POST', mode: 'no-cors', keepalive: true, credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: corpo }).catch(function () {});
    } catch (e) { /* il registro non deve mai bloccare il sito */ }
  }

  // Quando un consenso viene tolto: i cookie di prima parte di quella categoria. Quelli dei domini dei
  // servizi (linkedin.com, clarity.ms...) il sito non li può toccare: li spiega la cookie policy.
  function cancellaTraccia(statistiche, marketing) {
    var prefissi = [];
    if (statistiche) prefissi.push('_ga', '_clck', '_clsk', '_cltk');
    if (marketing) prefissi.push('_fbp', '_fbc', '_gcl', 'li_', 'ln_or');
    var host = location.hostname, parti = host.split('.');
    var domini = ['', host, '.' + host];
    if (parti.length > 2) domini.push('.' + parti.slice(-2).join('.'));
    document.cookie.split('; ').forEach(function (kv) {
      var nome = kv.split('=')[0];
      if (!prefissi.some(function (p) { return nome.indexOf(p) === 0; })) return;
      domini.forEach(function (d) {
        document.cookie = nome + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
    try {
      if (statistiche) localStorage.removeItem('_cltk');
      if (marketing) ['_gcl_ls', 'lastExternalReferrer', 'lastExternalReferrerTime'].forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) { /* storage non disponibile */ }
  }

  // ── Servizi caricati solo col consenso ────────────────────────────────────

  var caricati = {};

  function script(nome, src) {
    if (caricati[nome]) return;
    caricati[nome] = true;
    var s = document.createElement('script');
    s.async = true;
    s.dataset.consensoServizio = nome;
    if (PROVA) {
      s.type = 'text/plain';
      s.dataset.src = src;
      if (window.console) console.info('[consenso] in prova, non carico ' + nome + ': ' + src);
    } else {
      s.src = src;
    }
    document.head.appendChild(s);
  }

  function gtag() { window.dataLayer.push(arguments); }

  function applica(c) {
    window.dataLayer = window.dataLayer || [];
    var segnali = {
      analytics_storage: c.s ? 'granted' : 'denied',
      ad_storage: c.m ? 'granted' : 'denied',
      ad_user_data: c.m ? 'granted' : 'denied',
      ad_personalization: c.m ? 'granted' : 'denied'
    };
    if (c.s) {
      // Consent Mode v2: prima il default negato, poi la scelta, e solo dopo la configurazione.
      if (!caricati.ga4) {
        gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
        gtag('consent', 'update', segnali);
        gtag('js', new Date());
        gtag('config', SERVIZI.ga4);
      } else {
        gtag('consent', 'update', segnali);
      }
      script('ga4', 'https://www.googletagmanager.com/gtag/js?id=' + SERVIZI.ga4);

      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      script('clarity', 'https://www.clarity.ms/tag/' + SERVIZI.clarity);
      window.clarity('consentv2', { ad_Storage: segnali.ad_storage, analytics_Storage: 'granted' });
    }
    if (c.m) {
      if (!window.fbq) {
        var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!window._fbq) window._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        window.fbq('init', SERVIZI.metaPixel);
        window.fbq('track', 'PageView');
      }
      script('meta', 'https://connect.facebook.net/en_US/fbevents.js');

      window._linkedin_data_partner_ids = SERVIZI.linkedin.slice();
      if (!window.lintrk) {
        window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
        window.lintrk.q = [];
      }
      script('linkedin', 'https://snap.licdn.com/li.lms-analytics/insight.min.js');

      mostraIncorporati();
    }
    // Per gli script del sito che caricano contenuti di terze parti da sé (i video di script.js).
    document.dispatchEvent(new CustomEvent('laif:consenso', { detail: { statistiche: c.s, marketing: c.m } }));
  }

  // ── Contenuti incorporati (LinkedIn, YouTube) ─────────────────────────────

  function servizioDi(src) {
    return /linkedin\.com/.test(src) ? 'LinkedIn' : 'YouTube';
  }

  function linkEsterno(src) {
    var yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
    if (yt) return 'https://www.youtube.com/watch?v=' + yt[1];
    return src.replace('/embed/feed/update/', '/feed/update/');
  }

  function preparaIncorporati() {
    var c = leggi();
    document.querySelectorAll('iframe[data-consenso-src]').forEach(function (f) {
      if (c && c.m) { f.src = f.dataset.consensoSrc; return; }
      if (f.previousElementSibling && f.previousElementSibling.classList.contains('consenso-incorporato')) return;
      var servizio = servizioDi(f.dataset.consensoSrc);
      var box = document.createElement('div');
      box.className = 'consenso-incorporato';
      var p = document.createElement('p');
      p.textContent = T.embed.replace('{servizio}', servizio);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'consenso-btn'; b.textContent = T.embedAccetta;
      b.addEventListener('click', function () {
        var ora = leggi();
        salva({ statistiche: ora ? ora.s : false, marketing: true }, 'embed');
        nascondiBanner();
      });
      var a = document.createElement('a');
      a.href = linkEsterno(f.dataset.consensoSrc); a.target = '_blank'; a.rel = 'noopener';
      a.textContent = T.embedApri.replace('{servizio}', servizio);
      box.append(p, b, a);
      f.parentNode.insertBefore(box, f);
    });
  }

  function mostraIncorporati() {
    document.querySelectorAll('.consenso-incorporato').forEach(function (box) { box.remove(); });
    document.querySelectorAll('iframe[data-consenso-src]').forEach(function (f) {
      if (!f.getAttribute('src')) f.src = f.dataset.consensoSrc;
    });
  }

  // ── Interfaccia ───────────────────────────────────────────────────────────

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; });
  }

  function linkPolicy() {
    var a = document.querySelector('a[href$="cookie-policy/index.html"]');
    return a ? a.getAttribute('href') : '/cookie-policy/';
  }

  var banner = null, pref = null;

  function mostraBanner() {
    if (banner) return;
    banner = el(
      '<section class="consenso-banner" role="dialog" aria-modal="false" aria-labelledby="consenso-titolo" aria-describedby="consenso-testo">' +
        '<button type="button" class="consenso-x" data-consenso="chiudi" aria-label="' + esc(T.chiudi) + '">×</button>' +
        '<h2 id="consenso-titolo">' + esc(T.titolo) + '</h2>' +
        '<p id="consenso-testo">' + esc(T.testo) + ' <a href="' + esc(linkPolicy()) + '">' + esc(T.policy) + '</a></p>' +
        '<div class="consenso-azioni">' +
          '<button type="button" class="consenso-btn" data-consenso="rifiuta">' + esc(T.rifiuta) + '</button>' +
          '<button type="button" class="consenso-btn consenso-btn-testo" data-consenso="personalizza">' + esc(T.personalizza) + '</button>' +
          '<button type="button" class="consenso-btn" data-consenso="accetta">' + esc(T.accetta) + '</button>' +
        '</div>' +
      '</section>'
    );
    banner.addEventListener('click', function (e) {
      var azione = e.target.closest('[data-consenso]');
      if (!azione) return;
      var a = azione.dataset.consenso;
      if (a === 'accetta') { salva({ statistiche: true, marketing: true }, 'accept_all'); nascondiBanner(); }
      if (a === 'rifiuta') { salva({ statistiche: false, marketing: false }, 'reject_all'); nascondiBanner(); }
      if (a === 'chiudi') { salva({ statistiche: false, marketing: false }, 'close'); nascondiBanner(); }
      if (a === 'personalizza') apriPreferenze();
    });
    document.body.appendChild(banner);
  }

  function nascondiBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  function apriPreferenze() {
    var c = leggi();
    if (pref) pref.remove();
    var righe = CATEGORIE.map(function (k) {
      var acceso = k.fissa || (c && (k.id === 'statistiche' ? c.s : c.m));
      return '<div class="consenso-categoria">' +
        '<label><input type="checkbox" name="' + k.id + '"' + (acceso ? ' checked' : '') + (k.fissa ? ' disabled' : '') + '>' +
        '<span>' + esc(k.nome) + (k.fissa ? ' <small>' + esc(T.sempre) + '</small>' : '') + '</span></label>' +
        '<p>' + esc(k.testo) + ' <small>' + esc(T.servizi) + ': ' + esc(k.servizi) + '</small></p></div>';
    }).join('');
    var stato = c ? T.stato.replace('{id}', esc(c.id)).replace('{data}', new Date(c.t).toLocaleString(en ? 'en-GB' : 'it-IT')) : T.nessuno;
    pref = el(
      '<dialog class="consenso-pref" aria-labelledby="consenso-pref-titolo">' +
        '<form method="dialog">' +
          '<button type="button" class="consenso-x" data-consenso="annulla" aria-label="' + esc(T.chiudiPref) + '">×</button>' +
          '<h2 id="consenso-pref-titolo">' + esc(T.prefTitolo) + '</h2>' +
          '<p>' + esc(T.prefTesto) + ' <a href="' + esc(linkPolicy()) + '">' + esc(T.elenco) + '</a></p>' +
          righe +
          '<p class="consenso-stato">' + stato + '</p>' +
          '<div class="consenso-azioni">' +
            '<button type="button" class="consenso-btn" data-consenso="rifiuta">' + esc(T.rifiuta) + '</button>' +
            '<button type="button" class="consenso-btn consenso-btn-testo" data-consenso="salva">' + esc(T.salva) + '</button>' +
            '<button type="button" class="consenso-btn" data-consenso="accetta">' + esc(T.accetta) + '</button>' +
          '</div>' +
        '</form>' +
      '</dialog>'
    );
    pref.addEventListener('click', function (e) {
      var azione = e.target.closest('[data-consenso]');
      if (!azione) return;
      var a = azione.dataset.consenso, f = pref.querySelector('form');
      if (a === 'accetta') salva({ statistiche: true, marketing: true }, 'accept_all');
      if (a === 'rifiuta') salva({ statistiche: false, marketing: false }, 'reject_all');
      if (a === 'salva') salva({ statistiche: f.elements.statistiche.checked, marketing: f.elements.marketing.checked }, 'custom');
      if (a !== 'annulla') nascondiBanner();
      chiudiPreferenze();
    });
    // Esc o «×» chiudono senza decidere: se una scelta non c'è ancora, il banner resta.
    pref.addEventListener('close', function () { chiudiPreferenze(); });
    document.body.appendChild(pref);
    pref.showModal();
  }

  function chiudiPreferenze() {
    if (!pref) return;
    var p = pref; pref = null;
    if (p.open) p.close();
    p.remove();
    aggiornaStato();
  }

  function aggiornaStato() {
    var c = leggi();
    document.querySelectorAll('[data-consenso-stato]').forEach(function (n) {
      n.textContent = c ? T.stato.replace('{id}', c.id).replace('{data}', new Date(c.t).toLocaleString(en ? 'en-GB' : 'it-IT')) : T.nessuno;
    });
  }

  // ── Avvio ─────────────────────────────────────────────────────────────────

  function avvia() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-consenso-apri]')) { e.preventDefault(); apriPreferenze(); }
    });
    preparaIncorporati();
    aggiornaStato();
    var c = leggi();
    if (c) applica(c);
    else mostraBanner();
  }

  window.LaifConsenso = {
    apri: apriPreferenze,
    stato: leggi,
    statistiche: function () { var c = leggi(); return !!(c && c.s); },
    marketing: function () { var c = leggi(); return !!(c && c.m); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();
})();
