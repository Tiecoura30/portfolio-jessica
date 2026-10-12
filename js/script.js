const conteneur = document.querySelector("#liste-projets");
let tousLesProjets = [];

/* ---------- Projets chargés depuis data/projets.json ---------- */

const libellesCategories = {
  reseaux: "Réseaux",
  linux: "Linux",
  fibre: "Fibre optique"
};

function creerCarte(p) {
  const categorie = libellesCategories[p.categorie] || p.categorie;
  return `
    <article class="col">
      <div class="card carte-projet h-100">
        <img src="${p.image}" alt="Capture de ${p.titre}" loading="lazy">
        <div class="card-body">
          <span class="badge-violet align-self-start mb-3">${categorie}</span>
          <h3 class="card-title">${p.titre}</h3>
          <p class="card-text">${p.description}</p>
          <a href="${p.lien}" class="lien-projet">Voir le projet <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
        </div>
      </div>
    </article>`;
}

function afficherProjets(liste) {
  conteneur.innerHTML = liste.map(creerCarte).join("");
}

async function chargerProjets() {
  try {
    const reponse = await fetch("data/projets.json");
    const donnees = await reponse.json();
    tousLesProjets = donnees;
    afficherProjets(tousLesProjets);
  } catch (erreur) {
    console.error("Erreur de chargement :", erreur);
    conteneur.innerHTML = `<p class="text-danger">Impossible de charger les projets.</p>`;
  }
}

chargerProjets();

/* ---------- Filtres (délégation d'événements) ---------- */

document.querySelector("#filtres").addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  const categorie = btn.dataset.categorie;
  if (categorie === "tous") {
    afficherProjets(tousLesProjets);
  } else {
    afficherProjets(tousLesProjets.filter((p) => p.categorie === categorie));
  }

  document.querySelectorAll("#filtres button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
});

/* ---------- Thème sombre (par défaut) / clair, mémorisé ---------- */

const btnTheme = document.querySelector("#btn-theme");

function appliquerTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  btnTheme.textContent = theme === "dark" ? "Mode clair" : "Mode sombre";
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    /* stockage indisponible : le thème ne sera simplement pas mémorisé */
  }
}

let themeMemorise = null;
try {
  themeMemorise = localStorage.getItem("theme");
} catch (e) {}
appliquerTheme(themeMemorise === "light" ? "light" : "dark");

btnTheme.addEventListener("click", () => {
  const actuel = document.documentElement.getAttribute("data-bs-theme");
  appliquerTheme(actuel === "dark" ? "light" : "dark");
});

/* ---------- Effet de frappe sur l'accueil ---------- */

const texteAnime = document.querySelector("#texte-anime");
const phrases = [
  "Étudiante en réseaux et télécoms",
  "Passionnée par Cisco et Linux",
  "À la recherche d'un stage"
];
const reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function taper(indexPhrase = 0, indexLettre = 0, suppression = false) {
  const phrase = phrases[indexPhrase];
  texteAnime.textContent = phrase.slice(0, indexLettre);

  let delai = suppression ? 35 : 70;
  if (!suppression && indexLettre === phrase.length) {
    suppression = true;
    delai = 1800; // pause quand la phrase est complète
  } else if (suppression && indexLettre === 0) {
    suppression = false;
    indexPhrase = (indexPhrase + 1) % phrases.length;
    delai = 400;
  }
  const suivant = suppression ? indexLettre - 1 : indexLettre + 1;
  setTimeout(() => taper(indexPhrase, Math.max(0, Math.min(suivant, phrase.length)), suppression), delai);
}

if (!reduireMouvement) taper();

/* ---------- Bouton « retour en haut » ---------- */

const btnTop = document.querySelector("#btn-top");

window.addEventListener("scroll", () => {
  btnTop.classList.toggle("d-none", window.scrollY <= 300);
});

btnTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- Validation du formulaire ---------- */

const form = document.querySelector("#form-contact");
const zoneMessage = document.querySelector("#form-message");

function marquer(champ, estValide) {
  champ.classList.toggle("is-valid", estValide);
  champ.classList.toggle("is-invalid", !estValide);
  return estValide;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const champNom = document.querySelector("#nom");
  const champEmail = document.querySelector("#email");
  const champMessage = document.querySelector("#message");
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const nomOk = marquer(champNom, champNom.value.trim().length >= 2);
  const emailOk = marquer(champEmail, regexEmail.test(champEmail.value.trim()));
  const messageOk = marquer(champMessage, champMessage.value.trim().length >= 10);

  if (nomOk && emailOk && messageOk) {
    const nom = champNom.value.trim(); // à garder AVANT form.reset()
    form.reset();

    // append() : le nom saisi n'est jamais interprété comme du HTML
    const alerte = document.createElement("div");
    alerte.className = "alert alert-success mb-0";
    alerte.append("Merci ", nom, " ! Votre message a bien été envoyé.");
    zoneMessage.replaceChildren(alerte);

    [champNom, champEmail, champMessage].forEach((c) => c.classList.remove("is-valid"));
  } else {
    zoneMessage.innerHTML = "";
  }
});
