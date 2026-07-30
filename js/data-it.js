/* ============================================================
   Assistente Email · GOFO Servizio Posta Elettronica (IT)
   Dati Albero Decisionale  data-it.js
   ============================================================
   Questo file definisce tutti i nodi dell'albero decisionale.

   1. Nodo Domanda (t: 'q')
      - tag:   Etichetta del passo
      - title: Titolo domanda
      - opts:  Array opzioni:
          label: Testo opzione
          next:  ID prossimo nodo
          note:  Opzionale, nota piccola
          alert: Opzionale, avviso dopo selezione

   2. Nodo Risultato (t: 'r')
      - script:   Template risposta
      - cat:      Categoria [1o, 2o, 3o livello]
      - report:   Segnalazione problema
      - esc:      Escalation (vuoto = nessuna)
      - note:     Note operative
      - ref:      Riferimento SOP / Classificazione
      - attach:   Opzionale, allegato
      - evidence: Opzionale, prove foto/video
   ============================================================ */

window.NODES_IT = {

  /* =================== INGRESSO =================== */
  start: {
    t: 'q',
    tag: 'Passo 1',
    title: 'Questa email appartiene al tuo paese locale?',
    opts: [
      {
        label: 'No (es. email NL assegnata a IT)',
        next: 'R_allocate',
        alert: 'Email non locale: non rispondere, non registrare, solo assegnare.'
      },
      { label: 'Sì', next: 'q_track' }
    ]
  },

  /* =================== VERIFICA TRACKING NUMERO =================== */
  q_track: {
    t: 'q',
    tag: 'Passo 2',
    title: 'Sì puo estrarre un tracking numero valido dall\'email?',
    opts: [
      { label: 'Nessun tracking numero / Errato', next: 'R_notrack' },
      { label: 'Sì, corretto', next: 'q_link' }
    ]
  },

  /* =================== ASSOCIAZIONE TICKET =================== */
  q_link: {
    t: 'q',
    tag: 'Passo 3',
    title: 'Badge rosso ticket >=2 e richieste coerenti?',
    opts: [
      {
        label: 'Sì (associa ticket)',
        next: 'q_situation',
        alert: 'Copia email → Associa stessa email → Seleziona tutti → Conferma.'
      },
      { label: 'No / Incerto', next: 'q_situation' }
    ]
  },

  /* =================== SCENARIO PRINCIPALE =================== */
  q_situation: {
    t: 'q',
    tag: 'Passo 4 · Scenario',
    title: 'Scenario principale? (da ultimo stato tracking CPS)',
    grid: '4x3',
    opts: [
      { label: 'Non consegnato, richiesta tracking/sollecito',          note: 'Destinatario a casa? ~', next: 'q_unrecv' },
      { label: 'Consegnato ma non ricevuto',              next: 'q_pod' },
      { label: 'Modifica indirizzo/tel./preferenze',            next: 'q_modify' },
      { label: 'Pacco danneggiato',                                  next: 'q_damage' },
      { label: 'Pacco errato / contenuto mancante',                 next: 'q_wm' },
      { label: 'Richiesta punto ritiro (locker/PUDO)',             next: 'R_locker' },
      { label: 'Insoddisfazione qualita prodotto',               next: 'R_quality' },
      { label: 'Ringraziamento / presa visione',                 next: 'q_thanks' },
      { label: 'Reclamo servizio (corriere/assistenza)',               next: 'q_service' },
      { label: 'Altre richieste (blocco/reso/risarc./collab.)',   next: 'q_need' },
      { label: 'Reso al mittente',                            next: 'R_returned' },
      { label: 'Pre check-in (non ancora a GOFO)',                 next: 'R_prehub' }
    ]
  },

  /* =================== NON CONSEGNATO =================== */
  q_unrecv: {
    t: 'q',
    tag: 'Non Consegnato · Ramo',
    title: 'Stato del pacco non consegnato?',
    grid: '5x2',
    opts: [
      { label: 'Pre check-in hub (non a GOFO)',                      next: 'R_prehub' },
      { label: 'In transito hub nazionale',                    next: 'R_transit' },
      { label: 'Smistamento errato',                                             next: 'R_wrongsort' },
      { label: 'Guasto / forza maggiore',                            next: 'R_force' },
      { label: 'Destinatario assente',                                    next: 'R_notathome' },
      { label: 'Consegna fallita, destinatario presente',                     next: 'R_failwrong' },
      { label: 'Tracking fermo >24h',                                   next: 'q_stall' },
      {
        label: 'Sospetto Smarrimento',
        next: 'q_lost',
        note: 'Se smarrimento confermato, allegare PDF risarcimento',
        urgency: 'danger'
      },
      { label: 'In giacenza (indirizzo/tel. errato)',                          next: 'R_onshelf' },
      { label: 'Consegnato ma utente sollecita',                            next: 'R_stall_signed' }
    ]
  },

  q_stall: {
    t: 'q',
    tag: 'Tracking Fermo',
    title: 'Tracking fermo da quanto?',
    opts: [
      { label: '7-14 giorni',     next: 'R_stall714' },
      { label: 'Oltre 14 giorni',   next: 'R_stall14' }
    ]
  },

  q_lost: {
    t: 'q',
    tag: 'Sospetto Smarrimento',
    title: 'Smarrimento confermato in piattaforma?',
    opts: [
      { label: 'Non confermato', next: 'R_lost_pend' },
      {
        label: 'Confermato',
        next: 'R_lost_conf',
        note: 'Rispondi "Sospetto smarrimento (scuse+risarc.)" + allega PDF'
      }
    ]
  },

  /* =================== CONSEGNATO - POD =================== */
  q_pod: {
    t: 'q',
    tag: 'Consegnato · POD',
    title: 'POD (prova consegna) e conforme?',
    grid: '2x1',
    opts: [
      { label: 'Conforme',   next: 'q_pod_yes',   urgency: 'ok' },
      { label: 'Non conforme', next: 'q_pod_no',    urgency: 'warn' }
    ]
  },

  q_pod_yes: {
    t: 'q',
    tag: 'POD Conforme',
    title: 'N. contatti / casi particolari?',
    opts: [
      { label: '1o contatto',                      next: 'R_pody1' },
      { label: '2o contatto',                      next: 'R_pody2' },
      { label: 'Contatti multipli',                      next: 'R_podyM' },
      { label: 'Sospetto furto (preso da altri)',         next: 'R_podyS' },
      { label: 'Azione legale GOFO',                 next: 'R_podyL' },
      { label: 'Pacco recuperato',                    next: 'R_podyF' }
    ]
  },

  q_pod_no: {
    t: 'q',
    tag: 'POD Non Conforme',
    title: 'POD non conforme: segnalato falsa firma. N. contatti?',
    opts: [
      { label: '1o contatto', next: 'R_podn1' },
      { label: 'Contatti multipli', next: 'q_pod_no_m' }
    ]
  },

  q_pod_no_m: {
    t: 'q',
    tag: 'POD Non Conforme',
    title: 'Conclusione piattaforma su falsa firma?',
    opts: [
      { label: 'Falsa firma non confermata',                                 next: 'R_podnM_pend' },
      {
        label: 'Falsa firma confermata',
        next: 'R_podnM_conf',
        note: 'Rispondi "Falsa firma (risarc.)" + allega PDF'
      },
      { label: 'Non e falsa firma (procedi POD conforme)',            next: 'R_pody1' }
    ]
  },

  /* =================== MODIFICA DATI =================== */
  q_modify: {
    t: 'q',
    tag: 'MODIFICA DATI',
    title: 'Cosa modificare? (stato consegna non modificabile)',
    grid: '1x3',
    opts: [
      { label: 'Indirizzo / coordinate',                    next: 'q_addr' },
      { label: 'Telefono / note (preferenze)',        next: 'R_mod_phone' },
      { label: 'Nome / Email / Telefono',                   next: 'R_mod_identity' }
    ]
  },

  q_addr: {
    t: 'q',
    tag: 'MODIFICA INDIRIZZO',
    title: 'Nuovo indirizzo su Google Maps?',
    opts: [
      { label: 'Sì, trovato (corretto)',                        next: 'R_mod_addr_ok' },
      { label: 'Non trovato / ambiguo',         next: 'R_mod_addr_bad' }
    ]
  },

  /* =================== DANNI =================== */
  q_damage: {
    t: 'q',
    tag: 'DANNI',
    title: 'Tipo danno? (verificare se ricevuto)',
    grid: '2x2',
    opts: [
      { label: 'Il cliente non ha firmato e il pacco risultava danneggiato.',                next: 'R_dmg_nr',    urgency: 'warn' },
      { label: 'Firma ricevuta: pacco danneggiato, contenuto danneggiato/mancante.',         next: 'q_dmg_op',    urgency: 'danger' },
      { label: 'Firma ricevuta: imballo integro, contenuto danneggiato/mancante.',                next: 'q_dmg_ip',    urgency: 'warn' },
      { label: 'Firma ricevuta: imballo danneggiato, contenuto integro.',                next: 'R_dmg_ook',   urgency: 'ok' }
    ]
  },

  q_dmg_op: {
    t: 'q',
    tag: 'Imballo+Cont. KO',
    title: 'Danno visibile in foto POD?',
    opts: [
      { label: 'Visibile',   next: 'R_dmg_op_y' },
      { label: 'Non visibile',   next: 'R_dmg_op_n' }
    ]
  },

  q_dmg_ip: {
    t: 'q',
    tag: 'Imballo OK Cont. KO',
    title: 'Danno visibile in foto POD?',
    opts: [
      { label: 'Visibile',   next: 'R_dmg_ip_y' },
      { label: 'Non visibile',   next: 'R_dmg_ip_n' }
    ]
  },

  /* =================== PACCO ERRATO / �� =================== */
  q_wm: {
    t: 'q',
    tag: 'Errato/Mancante',
    title: 'Pacco errato o contenuto mancante? (imballo OK)',
    grid: '1x3',
    opts: [
      { label: 'Imballo OK, contenuto errato', next: 'q_wm_w' },
      { label: 'Imballo OK, contenuto mancante', next: 'q_wm_m' },
      { label: 'Pacco altrui (dati etichetta errati)', next: 'R_wrong_pkg' }
    ]
  },

  q_wm_w: {
    t: 'q',
    tag: 'PACCO ERRATO',
    title: 'Dati etichetta POD corrispondono?',
    opts: [
      { label: 'Non corrispondono',                  next: 'R_wm_w_no' },
      { label: 'Corrispondono (errore mittente)',    next: 'R_wm_w_yes' }
    ]
  },

  q_wm_m: {
    t: 'q',
    tag: 'CONTENUTO MANCANTE',
    title: 'Dati etichetta POD corrispondono?',
    opts: [
      { label: 'Corrispondono',                    next: 'R_wm_m_yes' },
      { label: 'Non corrispondono (verifica)',        next: 'R_wm_m_no' }
    ]
  },

  /* =================== RINGRAZ. / PRESA VISIONE =================== */
  q_thanks: {
    t: 'q',
    tag: 'Ringr./Visione',
    title: 'Ricevuto? Servono scuse?',
    grid: '2x2',
    opts: [
      { label: 'Non ricevuto · No scuse', next: 'R_th_n0' },
      { label: 'Non ricevuto · Scuse',   next: 'R_th_n1' },
      { label: 'Ricevuto · No scuse', next: 'R_th_r0' },
      { label: 'Ricevuto · Scuse',   next: 'R_th_r1' }
    ]
  },

  /* =================== RECLAMI SERVIZIO =================== */
  q_service: {
    t: 'q',
    tag: 'Servizio',
    title: 'Tipo reclamo / feedback?',
    grid: '3x4',
    opts: [
      { label: 'Furto corriere',                        next: 'R_srv_theft',       urgency: 'danger' },
      { label: 'Consegna violenta (danno merce)',    next: 'R_srv_v_dmg',       urgency: 'danger' },
      { label: 'Consegna violenta (danno proprieta)',    next: 'R_srv_v_prop',      urgency: 'danger' },
      { label: 'Corriere scortese',                  next: 'R_srv_att',         urgency: 'warn' },
      { label: 'Mancata consegna: motivo errato',            next: 'R_failwrong',       urgency: 'warn' },
      { label: 'Foto POD viola privacy',                  next: 'R_srv_pod',         urgency: 'warn' },
      { label: 'Consegna violenta (no danni)',          next: 'R_srv_v_nodmg',     urgency: '' },
      { label: 'Istruzioni non rispettate',                      next: 'R_srv_notdeliver',  urgency: '' },
      { label: 'Reclamo operatore',              next: 'R_srv_cs',          urgency: '' },
      { label: 'Feedback sistema (negativo)',            next: 'R_srv_sys',         urgency: '' },
      { label: 'Feedback positivo (elogio)',                  next: 'R_srv_praise',      urgency: 'ok' }
    ]
  },

  /* =================== ALTRE RICHIESTE =================== */
  q_need: {
    t: 'q',
    tag: 'ALTRE RICHIESTE',
    title: 'Tipo richiesta?',
    grid: '2x3',
    opts: [
      { label: 'Blocco consegna',                     next: 'R_need_nodeliver' },
      { label: 'Richiesta reso (consegnato)',                  next: 'R_need_return' },
      { label: 'Assistenza risarcimento',          next: 'R_need_claim' },
      { label: 'Consulenza collaborazioni',                     next: 'R_other_coop' },
      { label: 'Altro paese (gruppo errato)',              next: 'R_other_country' },
      { label: 'Altro (non elencato)',                  next: 'R_other_other' }
    ]
  },

  /* ================================================================
     NODI RISULTATO
     ================================================================ */

  R_allocate: {
    t: 'r',
    script: 'Clicca Assegna -> gruppo paese -> Conferma',
    cat:    ['Altro', 'Altro Paese', ''],
    report: 'Nessuna registrazione',
    esc:    '',
    note:   'Non rispondere, non registrare, solo assegnare.',
    ref:    'SOP 1.1'
  },

  R_notrack: {
    t: 'r',
    script: 'No Tracking Numero/Errato',
    cat:    ['Altro', 'No Tracking Numero/Errato', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Guida verifica tracking, assisti nuovo controllo.',
    ref:    'SOP 1.2 / Class. Altro - No Tracking'
  },

  R_prehub: {
    t: 'r',
    script: 'Richiesta pacco non ancora a GOFO',
    cat:    ['Richieste', 'Ricerca Tracking', 'Pre Check-in'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Informa stato logistico, pacco non ricevuto, contatta mittente.',
    ref:    'SOP 2.1 Caso 1 / Class. Richieste - Pre Check-in'
  },

  R_transit: {
    t: 'r',
    script: 'Cerca template per ultimo stato tracking.',
    cat:    ['Tempistiche', 'Sollecito', 'Auto: Entro/Oltre Termini'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Sistema determina auto. sollecito entro/oltre termini.',
    ref:    'SOP 2.1 Caso 2 / Class. Tempistiche - Sollecito'
  },

  R_wrongsort: {
    t: 'r',
    script: 'In indagine',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Caso smistamento errato.',
    ref:    'SOP 2.1 Caso 2(Speciale)'
  },

  R_force: {
    t: 'r',
    script: 'Forza maggiore',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Guasto veicolo o emergenza.',
    ref:    'SOP 2.1 Caso 2(Speciale)'
  },

  R_notathome: {
    t: 'r',
    script: 'Consegna fallita (assente)',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Destinatario effettivamente assente.',
    ref:    'SOP 2.1 Caso 2(Speciale)'
  },

  R_failwrong: {
    t: 'r',
    script: 'Consegna fallita (destinatario presente)',
    cat:    ['Servizio', 'Reclamo Corriere', 'Motivo Errato'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Consegna fallita ma destinatario presente → Scuse, richiamo norme, consegna rapida.',
    ref:    'SOP 2.1 Caso 2 (Speciale) / Class. Servizio - Motivo Errato'
  },

  R_stall714: {
    t: 'r',
    script: 'Tracking fermo 7-14 giorni — Rassicurazione',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito'],
    report: 'Non segnalare · Invia sollecito',
    esc:    '',
    note:   'Tracking esterno fermo 7-14 giorni.',
    ref:    'SOP 2.1 Caso 2 / Class. Tempistiche'
  },

  R_stall14: {
    t: 'r',
    script: 'Tracking fermo >14 giorni — Sospetto smarrimento, contattare venditore',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito/Smarr.'],
    report: 'Non segnalare · Invia sollecito',
    esc:    '',
    note:   'Tracking esterno fermo >14 giorni.',
    ref:    'SOP 2.1 Caso 2 / Class. Tempistiche'
  },

  R_lost_pend: {
    t: 'r',
    script: 'Indagine in corso, attendere（Consegnato Non Ricevutoreclamo）',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Smarrimento non confermato in piattaforma.',
    ref:    'SOP 2.1 Caso 2（Sospetto Smarrimento）'
  },

  R_lost_conf: {
    t: 'r',
    script: 'Sospetto Smarrimento（scuse+risarcimento） + RisarcimentoPDF risarcimento',
    cat:    ['Sicurezza', 'Smarrimento', 'Pacco Smarrito'],
    report: 'Non segnalare',
    esc:    '',
    attach: 'RisarcimentoPDF risarcimento',
    note:   'Smarrimento confermato; fornire prova se contestato.',
    ref:    'SOP 2.1 Caso 2（Sospetto Smarrimento）/ Class. Sicurezza - Pacco Smarrito'
  },

  R_onshelf: {
    t: 'r',
    script: 'Cerca template giacenza→ Nuove info, prossima consegna',
    cat:    ['Richieste', 'Modifica Richiesta', 'Modifica Dati'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Modifica waybill -> ordina riconsegna.',
    ref:    'SOP 2.1 Caso 2(Giacenza)/ Class. Richieste - Modifica Dati'
  },

  R_returned: {
    t: 'r',
    script: 'Reso consegnato',
    cat:    ['Richieste', 'Ricerca Tracking', 'Post Reso'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Informa stato, reso non gestibile, contatta mittente.',
    ref:    'SOP 2.1 Caso 3 / Class. Richieste - Post Reso'
  },

  R_pody1: {
    t: 'r',
    script: 'Consegnato non ricevuto, 1o contatto (invia POD) + foto POD',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato NR (POD OK)'],
    report: 'Non segnalare',
    esc:    '',
    attach: 'Foto POD',
    note:   'POD OK -> controlla cassette/vicini/portiere.',
    ref:    'SOP 2.2 Caso 1 / Class. Sicurezza - Non Ricevuto (POD OK)'
  },

  R_pody2: {
    t: 'r',
    script: 'Consegnato Non Ricevuto2o contatto',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato Non Ricevuto'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Contatta gruppo DSP per recupero pacco.',
    ref:    'SOP 2.2 Caso 1'
  },

  R_podyM: {
    t: 'r',
    script: 'Consegnato non ricevuto, controllare telecamere o POD conforme, contatti multipli',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato Non Ricevuto'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Contatti multipli.',
    ref:    'SOP 2.2 Caso 1'
  },

  R_podyS: {
    t: 'r',
    script: 'POD Conformema pacco preso da altri',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato Non Ricevuto'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Sospetto furto pacco.',
    ref:    'SOP 2.2 Caso 1'
  },

  R_podyL: {
    t: 'r',
    script: 'Escalation：crea gruppo dedicato DSP',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato Non Ricevuto'],
    report: 'Non segnalare',
    esc:    'Escalation',
    note:   'Azione legale GOFO, escalation necessaria.',
    ref:    'SOP 2.2 Caso 1'
  },

  R_podn1: {
    t: 'r',
    script: 'Indagine in corso, attendere（Consegnato Non Ricevutoreclamo）',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato Non Ricevuto'],
    report: 'Segnala: sospetta falsa firma (POD KO)',
    esc:    '',
    evidence: 'Se non trovato: foto esterna edificio (opzionale)',
    note:   'POD KO -> segnala + controlla + foto esterna (opzionale).',
    ref:    'SOP 2.2 Caso 2 / Class. Sicurezza - Non Ricevuto (POD KO)'
  },

  R_podnM_pend: {
    t: 'r',
    script: 'Contatti multipli senza esito',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato NR (Perso)'],
    report: 'Segnala: sospetta falsa firma (gia inviata)',
    esc:    '',
    note:   'Falsa firma non confermata in piattaforma.',
    ref:    'SOP 2.2 Caso 2'
  },

  R_podnM_conf: {
    t: 'r',
    script: 'Falsa firma (risarcimento) + PDF risarcimento',
    cat:    ['Sicurezza', 'Smarrimento', 'Consegnato Non Ricevuto'],
    report: 'Segnala: sospetta falsa firma (confermata)',
    esc:    '',
    attach: 'RisarcimentoPDF risarcimento',
    note:   'Falsa firma confermata in piattaforma.',
    ref:    'SOP 2.2 Caso 2 / Class. Sicurezza - Pacco Errato'
  },

  R_mod_phone: {
    t: 'r',
    script: 'Nuove info, prossima consegna',
    cat:    ['Richieste', 'Modifica Richiesta', 'Modifica Dati'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Modifica tel. + note preferenze in lingua locale.',
    ref:    'SOP 2.3 Caso 2 / Class. Richieste - Modifica Dati'
  },

  R_mod_addr_ok: {
    t: 'r',
    script: 'Nuove info, prossima consegna',
    cat:    ['Richieste', 'Modifica Richiesta', 'Modifica Dati'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Maps OK -> modifica indirizzo; avvisa rischio ritardo.',
    ref:    'SOP 2.3 Caso 1 / Class. Richieste - Mod. Indirizzo'
  },

  R_mod_addr_bad: {
    t: 'r',
    script: 'Verificare indirizzo di consegna con il destinatario',
    cat:    ['Richieste', 'Modifica Richiesta', 'Modifica Dati'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Indirizzo non trovato -> richiedi indirizzo Maps verificabile.',
    ref:    'SOP 2.3 Caso 1'
  },

  R_dmg_nr: {
    t: 'r',
    script: 'Pacco danneggiato (reso al cliente confermato in piattaforma)',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito (Danno non Ricevuto)'],
    report: 'Non segnalare',
    esc:    '',
    evidence: 'Basato su valutazione danno in piattaforma, confermare reso al cliente.',
    note:   'Non ricevuto, danno in piattaforma → Confermare reso al cliente.',
    ref:    'SOP 2.4 / Class. Tempistiche - Sollecito'
  },

  R_dmg_ook: {
    t: 'r',
    script: 'Cliente ha ricevuto il pacco (ringraziamento + scuse)',
    cat:    ['Sicurezza', 'Danni', 'Imballo KO Cont. OK'],
    report: 'Non segnalare',
    esc:    '',
    evidence: 'Solo imballaggio danneggiato, contenuto integro. Rassicurare il cliente.',
    note:   'Imballaggio danneggiato, contenuto integro → Rassicurare il cliente: il prodotto e funzionante.',
    ref:    'SOP 2.4 / Class. Sicurezza - Danno Imballo (Cont. OK)'
  },

  R_dmg_op_y: {
    t: 'r',
    script: 'Indagine in corso, attendere + Contattare il DSP per avviare la pratica di risarcimento',
    cat:    ['Sicurezza', 'Danni', 'Imballo KO Cont. KO'],
    report: 'Segnala: pacco danneggiato (POD OK)',
    esc:    '',
    evidence: 'La foto POD mostra il danno, utilizzabile come prova.',
    note:   'Danno visibile nella foto POD → Contattare il DSP per il risarcimento.',
    ref:    'SOP 2.4 / Class. Sicurezza - Danno Visibile POD'
  },

  R_dmg_op_n: {
    t: 'r',
    script: 'Indagine in corso, attendere + Richiedere video di sorveglianza',
    cat:    ['Sicurezza', 'Danni', 'Imballo KO Cont. KO'],
    report: 'Non segnalare',
    esc:    '',
    evidence: 'La foto POD non mostra segni visibili di danno. Richiedere video/foto di sorveglianza.',
    note:   'Danno non visibile nella foto POD → Rassicurare e richiedere video di sorveglianza.',
    ref:    'SOP 2.4 / Class. Sicurezza - Danno Non Visibile POD'
  },

  R_dmg_ip_y: {
    t: 'r',
    script: 'Indagine in corso, attendere + Contattare il DSP per avviare la pratica di risarcimento',
    cat:    ['Sicurezza', 'Danni', 'Imballo OK Cont. KO'],
    report: 'Segnala: pacco danneggiato (POD OK)',
    esc:    '',
    evidence: 'La foto POD mostra il danno. Contattare il DSP per il risarcimento.',
    note:   'Imballaggio integro ma contenuto danneggiato, POD mostra danno → Contattare il DSP per il risarcimento.',
    ref:    'SOP 2.4 / Class. Sicurezza - Danno Interno (POD OK)'
  },

  R_dmg_ip_n: {
    t: 'r',
    script: 'Prodotto danneggiato (scoperto dopo la consegna)',
    cat:    ['Sicurezza', 'Danni', 'Imballo OK Cont. KO'],
    report: 'Non segnalare',
    esc:    '',
    evidence: 'POD senza danni, responsabilita logistica non determinabile. Contattare il mittente.',
    note:   'Imballaggio integro, contenuto danneggiato → Invitare il destinatario a contattare il mittente.',
    ref:    'SOP 2.4 / Class. Sicurezza - Danno Interno (POD KO)'
  },

  R_wm_w_no: {
    t: 'r',
    script: 'Indagine in corso, attendere（Consegnato Non Ricevutoreclamo）',
    cat:    ['Sicurezza', 'Smarrimento', 'Imballo OK Cont. Errato'],
    report: 'Segnala: pacco danneggiato (POD KO)',
    esc:    '',
    note:   'Imballo OK, cont. errato, POD KO -> segnala.',
    ref:    'SOP 2.5 / Class. Sicurezza - Cont. Errato'
  },

  R_wm_w_yes: {
    t: 'r',
    script: 'Contatta mittente (errore mittente)',
    cat:    ['Sicurezza', 'Smarrimento', 'Imballo OK Cont. Errato'],
    report: 'Non segnalare',
    esc:    '',
    note:   'POD OK -> prob. errore mittente -> contatta.',
    ref:    'Class. Sicurezza - Cont. Errato'
  },

  R_wm_m_yes: {
    t: 'r',
    script: 'Contenuto pacco non conforme/mancante',
    cat:    ['Sicurezza', 'Smarrimento', 'Imballo OK Cont. Mancante'],
    report: 'Non segnalare',
    esc:    '',
    note:   'POD OK -> non determinabile -> contatta.',
    ref:    'SOP 2.5 / Class. Sicurezza - Cont. Mancante'
  },

  R_wm_m_no: {
    t: 'r',
    script: 'Verifica: imballo OK, contenuto mancante, POD non corrisponde',
    cat:    ['Sicurezza', 'Smarrimento', 'Imballo OK Cont. Mancante'],
    report: 'Segnala verifica (POD KO)',
    esc:    '',
    note:   'POD KO, verifica necessaria.',
    ref:    'Class. Sicurezza - Cont. Mancante'
  },

  R_th_n0: {
    t: 'r',
    script: 'Ringraziamento (non consegnato)',
    cat:    ['Altro', 'Comunicazione (Email)', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Non ricevuto, no scuse.',
    ref:    'SOP 2.6 / Class. Altro - Comunicazione'
  },

  R_th_n1: {
    t: 'r',
    script: 'Scuse sincere',
    cat:    ['Altro', 'Comunicazione (Email)', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Non ricevuto, scuse.',
    ref:    'SOP 2.6'
  },

  R_th_r0: {
    t: 'r',
    script: 'Ricevuto (grazie)',
    cat:    ['Altro', 'Comunicazione (Email)', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Ricevuto, no scuse.',
    ref:    'SOP 2.6 / Class. Altro - Comunicazione'
  },

  R_th_r1: {
    t: 'r',
    script: 'Cliente ha ricevuto il pacco (ringraziamento + scuse)',
    cat:    ['Altro', 'Comunicazione (Email)', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Ricevuto, scuse.',
    ref:    'SOP 2.6'
  },

  R_locker: {
    t: 'r',
    script: 'Richiesta locker/PUDO',
    cat:    ['Richieste', 'Modifica Richiesta', 'Modifica Dati'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Destinatario desidera punto ritiro.',
    ref:    'SOP 2.7 / Class. Richieste - Modifica Dati'
  },

  R_quality: {
    t: 'r',
    script: 'Reclamo qualita',
    cat:    ['Altro', 'Altro', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Insoddisfazione qualita -> Altro.',
    ref:    'SOP 2.8'
  },

  R_srv_att: {
    t: 'r',
    script: 'Rassicura e scusa',
    cat:    ['Servizio', 'Reclamo Corriere', 'Corriere scortese'],
    report: 'Segnala: qualita servizio consegna',
    esc:    '',
    note:   'Ostilita/insulti/attacchi personali.',
    ref:    'Class. Servizio - Corriere Scortese'
  },

  R_srv_v_nodmg: {
    t: 'r',
    script: 'Rassicura',
    cat:    ['Servizio', 'Reclamo Corriere', 'Consegna Violenta'],
    report: 'Non segnalare (no danni/prove insuff.)',
    esc:    '',
    note:   'Lancio senza danni alla merce.',
    ref:    'Class. Servizio - Consegna Violenta'
  },

  R_srv_v_dmg: {
    t: 'r',
    script: 'Procedere con la procedura danni',
    cat:    ['Servizio', 'Reclamo Corriere', 'Consegna Violenta'],
    report: 'Segnala: qualita servizio (danno merce)',
    esc:    '',
    note:   'Danno da consegna -> procedura danni.',
    ref:    'Class. Servizio - Consegna Violenta'
  },

  R_srv_theft: {
    t: 'r',
    script: 'Rassicura -> verifica -> segnala',
    cat:    ['Servizio', 'Reclamo Corriere', 'Furto corriere'],
    report: 'Segnala: qualita servizio consegna',
    esc:    '',
    note:   'Verifica prove: 1) ns. corriere 2) furto.',
    ref:    'Class. Servizio - Furto Corriere'
  },

  R_srv_pod: {
    t: 'r',
    script: 'Rassicurare e scusarsi → Correzione dati, rimuovere foto POD',
    cat:    ['Servizio', 'Reclamo Corriere', 'Foto POD viola privacy'],
    report: 'Non segnalare',
    esc:    '',
    note:   'POD con dati sensibili (casa/volto/documenti).',
    ref:    'Class. Servizio - POD Privacy'
  },

  R_srv_cs: {
    t: 'r',
    script: 'Rassicura e scusa',
    cat:    ['Servizio', 'Reclamo Operatore', 'Atteggiamento Scortese'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Ostilita/interruzioni/insulti/chiusura unilaterale.',
    ref:    'Class. Servizio - Attegg. Operatore'
  },

  R_srv_sys: {
    t: 'r',
    script: 'Rassicura -> registra -> feedback',
    cat:    ['Servizio', 'Feedback Sistema', 'Insoddisf. Sistema'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Tracking/ETA/notifiche imprecise.',
    ref:    'Class. Servizio - Feedback Sistema'
  },

  R_srv_praise: {
    t: 'r',
    script: 'Grazie! Serviamo con cura (elogio op.); Grazie! Riferiremo (elogio corriere)',
    cat:    ['Servizio', 'Feedback Positivo', 'Elogio Op./Corriere'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Feedback positivo.',
    ref:    'Class. Servizio - Feedback Positivo'
  },

  R_need_nodeliver: {
    t: 'r',
    script: 'Giacenza/reso: ordina reso; altri: attendi',
    cat:    ['Richieste', 'Modifica Richiesta', 'Blocco Consegna'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Blocco. Giacenza/reso: ordina reso; altri: attendi.',
    ref:    'Class. Richieste - Blocco Consegna'
  },

  R_need_return: {
    t: 'r',
    script: 'Rassicura -> reso no post-consegna -> contatta',
    cat:    ['Richieste', 'Richiesta Reso', 'Richiesta Reso'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Consegnato, richiesta reso.',
    ref:    'Class. Richieste - Richiesta Reso'
  },

  R_need_claim: {
    t: 'r',
    script: 'Contattare il mittente per post-vendita (risarcimento gia verificato)',
    cat:    ['Richieste', 'Risarcimento', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Mittente inadempiente, cliente chiede aiuto.',
    ref:    'Class. Richieste - Risarcimento'
  },

  R_other_coop: {
    t: 'r',
    script: 'Accoglienza -> registra -> email collaborazioni',
    cat:    ['Altro', 'Consulenza Collab.', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Trasporto/consegna (DSP)/grandi clienti.',
    ref:    'Class. Altro - Consulenza'
  },

  R_other_country: {
    t: 'r',
    script: 'Comunica -> fornisci contatti corretti',
    cat:    ['Altro', 'Altro Paese', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Gruppo errato (es. IT contatta NL).',
    ref:    'Class. Altro - Altro Paese'
  },

  R_other_other: {
    t: 'r',
    script: 'Chiedi dettagli -> registra',
    cat:    ['Altro', 'Altro', ''],
    report: 'Non segnalare',
    esc:    '',
    note:   'Non elencato, registra in dettaglio.',
    ref:    'Class. Altro - Altro'
  },

  /* ================================================================
     NODI SUPPLEMENTARI
     ================================================================ */

  // Sicurezza-Smarrimento-Pacco Recuperato
  R_podyF: {
    t: 'r',
    script: 'Grazie, pacco recuperato',
    cat:    ['Sicurezza', 'Smarrimento', 'Pacco Recuperato'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Consegnato, recuperato.',
    ref:    'Class. Sicurezza - Recupero'
  },

  // Sicurezza-Smarrimento-Pacco Errato Ricevuto (dati etichetta errati)
  R_wrong_pkg: {
    t: 'r',
    script: 'Indagine in corso, attendere（Consegnato Non Ricevutoreclamo）',
    cat:    ['Sicurezza', 'Smarrimento', 'Pacco Errato Ricevuto'],
    report: 'Segnala: sospetta falsa firma (dati errati)',
    esc:    '',
    note:   'Dati errati -> prob. errore DSP -> segnala.',
    ref:    'Class. Sicurezza - Pacco Errato Ricevuto'
  },

  // Servizio-Reclamo Corriere-Consegna Violenta-Danni a Proprieta
  R_srv_v_prop: {
    t: 'r',
    script: 'Rassicura -> segnala',
    cat:    ['Servizio', 'Reclamo Corriere', 'Consegna Violenta'],
    report: 'Segnala: qualita servizio (danno proprieta)',
    esc:    '',
    note:   'Danni a proprieta da consegna violenta.',
    ref:    'Class. Servizio - Consegna Violenta'
  },

  // Servizio-Reclamo Corriere-Istruzioni non rispettate
  R_srv_notdeliver: {
    t: 'r',
    script: 'Scuse -> verifica -> richiamo norme',
    cat:    ['Servizio', 'Reclamo Corriere', 'Istruzioni non rispettate'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Corriere non ha rispettato istruzioni.',
    ref:    'Class. Servizio - Istr. Non Risp.'
  },

  // Tempistiche-Sollecito-Sollecito Consegnato
  R_stall_signed: {
    t: 'r',
    script: 'Consegnato, info data/firma',
    cat:    ['Tempistiche', 'Sollecito', 'Sollecito Consegnato'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Consegnato, comunicare dettagli consegna.',
    ref:    'Class. Tempistiche - Sollecito Consegn.'
  },

  // Richieste-Modifica Richiesta-Mod. Nome/Email/Tel.
  R_mod_identity: {
    t: 'r',
    script: 'Modifica annotata',
    cat:    ['Richieste', 'Modifica Richiesta', 'Mod. Nome/Email/Tel.'],
    report: 'Non segnalare',
    esc:    '',
    note:   'Modifica nome/email/tel.',
    ref:    'Class. Richieste - Mod. Dati Personali'
  }
};