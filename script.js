const WEBHOOK_URL = 'https://n8n.srv999542.hstgr.cloud/webhook-test/07f97cbe-99de-4f60-afb6-e96d6563ad7d';

const PAYS = ["Afghanistan","Afrique du Sud","Albanie","Algérie","Allemagne","Andorre","Angola","Argentine","Arménie","Australie","Autriche","Azerbaïdjan","Belgique","Bénin","Bolivie","Brésil","Bulgarie","Burkina Faso","Cameroun","Canada","Cap-Vert","Chili","Chine","Colombie","Congo","Corée du Sud","Costa Rica","Côte d'Ivoire","Croatie","Cuba","Danemark","Égypte","Émirats arabes unis","Espagne","Estonie","Éthiopie","États-Unis","Finlande","France","Gabon","Ghana","Grèce","Guatemala","Guinée","Honduras","Hongrie","Inde","Indonésie","Irlande","Islande","Israël","Italie","Japon","Jordanie","Kazakhstan","Kenya","Kosovo","Liban","Luxembourg","Madagascar","Mali","Malte","Maroc","Mauritanie","Mexique","Monaco","Mozambique","Namibie","Niger","Nigéria","Norvège","Nouvelle-Zélande","Ouganda","Pakistan","Panama","Paraguay","Pays-Bas","Pérou","Philippines","Pologne","Portugal","Qatar","République tchèque","Roumanie","Royaume-Uni","Russie","Rwanda","Sénégal","Serbie","Singapour","Slovaquie","Slovénie","Suède","Suisse","Tanzanie","Tchad","Thaïlande","Togo","Tunisie","Turquie","Ukraine","Uruguay","Venezuela","Vietnam","Zambie","Zimbabwe"];

(function fillSelects(){
  ['p1_nat','p2_nat','team_pays'].forEach(id=>{
    const s = document.getElementById(id);
    if(s) {
      PAYS.forEach(p=>{const o=document.createElement('option');o.value=o.textContent=p;s.appendChild(o);});
    }
  });
  document.getElementById('team_pays').value = 'Sénégal';
})();

let step = 1;
const STEPS = 4;
const PROGRESS = [25, 50, 75, 100];

function goStep(n) {
  document.querySelectorAll('.step-view').forEach(v => v.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  for (let i = 1; i <= STEPS; i++) {
    const d = document.getElementById('d' + i), c = document.getElementById('dc' + i);
    d.classList.remove('active', 'done');
    if (i < n) { d.classList.add('done'); c.textContent = '✓'; }
    else if (i === n) { d.classList.add('active'); c.textContent = i; }
    else c.textContent = i;
    if (i < STEPS) document.getElementById('l' + i).classList.toggle('done', i < n);
  }
  document.getElementById('progress-bar').style.width = PROGRESS[n - 1] + '%';
  document.getElementById('step-count').textContent = 'Étape ' + n + ' / ' + STEPS;
  document.getElementById('btn-back').style.visibility = n > 1 ? 'visible' : 'hidden';
  document.getElementById('btn-next').textContent = n === STEPS ? '🏆 Confirmer' : 'Continuer →';
  document.getElementById('step-body').scrollTop = 0;
}

function validate(s) {
  let ok = true;
  const currentStepView = document.getElementById(`step-${s}`);
  // Valide uniquement les champs "required" visibles dans l'étape active
  const inputs = currentStepView.querySelectorAll('input[required], select[required]');
  
  inputs.forEach(input => {
    let isFieldOk = true;
    
    if (input.type === 'radio' || input.type === 'checkbox') {
      if (input.type === 'radio') {
        isFieldOk = !!currentStepView.querySelector(`input[name="${input.name}"]:checked`);
      } else {
        isFieldOk = input.checked;
      }
    } else {
      isFieldOk = input.value.trim() !== '';
      if (input.type === 'email' && isFieldOk) {
        isFieldOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      }
    }

    input.classList.toggle('err', !isFieldOk);
    const errorId = `e-${input.name || input.id}`;
    const errMsg = document.getElementById(errorId);
    
    if (errMsg) errMsg.style.display = isFieldOk ? 'none' : 'block';
    if (!isFieldOk) ok = false;
  });
  
  return ok;
}

function nextStep() {
  if (!validate(step)) {
    const app = document.querySelector('.app');
    app.style.animation = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => { app.style.animation = 'shake 0.4s ease'; }));
    return;
  }
  if (step === STEPS) { submit(); return; }
  if (step === STEPS - 1) buildSummary();
  step++; goStep(step);
}

function prevStep() { if (step > 1) { step--; goStep(step); } }

function row(k, v) { return `<div class="sum-row"><span class="sum-key">${k}</span><span class="sum-val">${v || '—'}</span></div>`; }

function buildSummary() {
  // Récupération facile via FormData
  const form = document.getElementById('registrationForm');
  const d = Object.fromEntries(new FormData(form).entries());
  
  document.getElementById('sum-p1').innerHTML =
    row('Nom', d.p1_prenom + ' ' + d.p1_nom) +
    row('Email', d.p1_email) +
    row('Tél.', d.p1_tel) +
    row('Naissance', d.p1_ddn) +
    row('Nationalité', d.p1_nat) +
    row('Licence FIP', d.p1_licence) +
    row('Classement', d.p1_rank) +
    row('Catégorie', d.cat || '—') +
    row('Points FIP', d.p1_points);

  document.getElementById('sum-p2').innerHTML =
    row('Nom', d.p2_prenom + ' ' + d.p2_nom) +
    row('Email', d.p2_email) +
    row('Naissance', d.p2_ddn) +
    row('Nationalité', d.p2_nat) +
    row('Licence FIP', d.p2_licence) +
    row('Classement', d.p2_rank) +
    row('Points FIP', d.p2_points) +
    row('Tél.', d.p2_telephone);

  document.getElementById('sum-team').innerHTML =
    row('Équipe', d.team_name) +
    row('Pays', d.team_pays) +
    row('Tableau', d.tab || '—') +
    row('Hébergement', d.heberg) +
    row('Transfert', d.transfert);
}

async function submit() {
  if (!document.getElementById('ck1').checked || !document.getElementById('ck2').checked) {
    document.getElementById('e-ck').style.display = 'block';
    return;
  }
  document.getElementById('e-ck').style.display = 'none';
  
  const btn = document.getElementById('btn-next');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>';

  const form = document.getElementById('registrationForm');

  // 🔥 récupération brute
  const raw = Object.fromEntries(new FormData(form).entries());

  // 🔒 sécurisation (évite undefined)
  const d = {
    ...raw,
    cat: raw.cat || '',
    tab: raw.tab || '',
    ck3: raw.ck3 ? true : false,
    d_arrivee: raw.d_arrivee || '',
    d_depart: raw.d_depart || '',
    food: raw.food || '',
    heberg: raw.heberg || 'Non',
    transfert: raw.transfert || 'Non'
  };

  const ref = 'SOP-' +
    (d.team_name || 'XXX').slice(0, 3).toUpperCase() +
    '-' +
    Date.now().toString(36).slice(-6).toUpperCase();

  // 📦 payload propre (AUCUN undefined)
  const payload = {
    meta: {
      tournament: 'Sénégal Open Padel',
      edition: '2026',
      date: new Date().toISOString(),
      ref
    },

    joueur_1: {
      prenom: d.p1_prenom || '',
      nom: d.p1_nom || '',
      email: d.p1_email || '',
      telephone: d.p1_tel || '',
      date_naissance: d.p1_ddn || '',
      nationalite: d.p1_nat || '',
      passeport: d.p1_passport || '',
      licence: d.p1_licence || '',
      classement: d.p1_rank || '',
      categorie: d.cat,
      points_fip: d.p1_points || ''
    },

    joueur_2: {
      prenom: d.p2_prenom || '',
      nom: d.p2_nom || '',
      email: d.p2_email || '',
      telephone: d.p2_telephone || '',
      date_naissance: d.p2_ddn || '',
      nationalite: d.p2_nat || '',
      passeport: d.p2_passport || '',
      licence: d.p2_licence || '',
      classement: d.p2_rank || '',
      points_fip: d.p2_points || ''
    },

    equipe: {
      nom: d.team_name || '',
      pays: d.team_pays || '',
      tableau: d.tab
    },

    logistique: {
      arrivee: d.d_arrivee,
      depart: d.d_depart,
      hebergement: d.heberg,
      transfert: d.transfert,
      alimentation: d.food
    },

    communications: d.ck3
  };

  // 🧪 DEBUG ULTRA IMPORTANT
  console.log("📥 FORM DATA:", d);
  console.log("📤 PAYLOAD ENVOYÉ:", payload);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    console.log("✅ STATUS:", res.status);
    console.log("📨 RESPONSE:", text);

  } catch (e) {
    console.error('❌ ERREUR WEBHOOK:', e);
  }

  // 🎉 UI succès (inchangé)
  setTimeout(() => {
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementById('step-body').innerHTML = `
      <div class="success-view">
        <div class="success-ring">✓</div>
        <h2>Inscription <span style="color:var(--gold)">Confirmée</span></h2>
        <p style="font-size:12px;color:var(--muted);max-width:300px;margin:8px auto 14px;line-height:1.6">
          L'équipe <strong style="color:var(--text)">${payload.equipe.nom}</strong> est officiellement inscrite.
        </p>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--gold);letter-spacing:0.12em;margin-bottom:14px">${ref}</div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:3px">Confirmation à</div>
        <div style="font-size:13px;color:var(--green-bright);font-weight:600;margin-bottom:24px">${payload.joueur_1.email}</div>
      </div>`;
  }, 700);
}

document.addEventListener('input', e => {
  if (e.target.matches('input,select,textarea')) {
    e.target.classList.remove('err');
    const err = document.getElementById(`e-${e.target.name || e.target.id}`);
    if (err) err.style.display = 'none';
  }
});