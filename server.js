require('dotenv').config({ path: './mon_regime_pack.env' });
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Fonction robuste pour extraire du JSON même si du texte entoure
function extractJSON(text) {
  if (!text || typeof text !== "string") return null;

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) return null;

  const jsonText = text.substring(first, last + 1).trim();

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.warn("⚠️ JSON invalide malgré extraction : ", err.message);
    return null;
  }
}

// Route API IA
app.post('/api/gen_recette', async (req, res) => {
  try {
    const { jour, repas, ingredients } = req.body || {};

    console.log("📥 Requête reçue :", { jour, repas, ingredients });

    const prompt = `
Tu es un chef professionnel, spécialiste de la cuisine simple, réaliste et inspirée de vraies recettes existantes.
Tu dois créer une recette cohérente à partir d'une liste d'ingrédients.

🎯 OBJECTIFS :
1. Identifier automatiquement :
   - l'ingrédient principal (protéine : viande, poisson, œuf…)
   - les légumes dominants
   - les féculents ou accompagnements
2. T'inspirer de recettes françaises, italiennes, méditerranéennes, familiales ou bistrot.
3. Produire une recette cohérente, réalisable et savoureuse.

📌 CONTRAINTES DE FORMAT :
Tu dois répondre **UNIQUEMENT avec un JSON valide**, STRICTEMENT au format suivant :

{
  "titre": "",
  "temps": "ex: 30 min",
  "difficulte": "Facile",
  "etapes": [
    "Étape 1…",
    "Étape 2…",
    "Étape 3…"
  ]
}

⚠️ IMPORTANT :
- Pas de texte avant ou après le JSON.
- "etapes" doit être une liste de chaînes de texte uniquement.
- Le nombre d'étapes doit être entre 5 et 7.

🧑‍🍳 STYLE DES ÉTAPES :
- Indiquer les méthodes de cuisson (rôtir, saisir, mijoter…)
- Donner les températures (ex : feu moyen, 180°C, etc.)
- Donner des durées approximatives
- Expliquer l'assaisonnement (sel, poivre, herbes…)
- Décrire l'ordre d'ajout des ingrédients

📦 INGREDIENTS À UTILISER :
${ingredients}

Génère maintenant une recette complète et réaliste.
`;

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        messages: [
          { role: "system", content: "Tu es un assistant qui ne répond qu'en JSON valide." },
          { role: "user", content: prompt }
        ],
        stream: false,
        options: {
          response_format: "json",
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      console.error("🔥 Erreur réseau Ollama :", response.status, response.statusText);
      throw new Error("Réponse Ollama invalide");
    }

    const data = await response.json();
    const content = data?.message?.content || "";

    console.log("🧠 Réponse IA brute :", content);

    let recette = extractJSON(content);

    // Sécurité : si pas JSON → recette par défaut
    if (!recette || !recette.titre || !Array.isArray(recette.etapes)) {
      console.warn("⚠️ JSON incorrect, utilisation du fallback.");
      recette = {
        titre: "Recette improvisée",
        temps: "30 min",
        difficulte: "Facile",
        etapes: [
          "Préparez vos ingrédients.",
          "Chauffez votre poêle.",
          "Assemblez tous les éléments.",
          "Assaisonnez selon votre goût.",
          "Servez et dégustez."
        ]
      };
    }

    console.log("✅ Recette extraite :", recette.titre);
    res.json(recette);

  } catch (err) {
    console.error("💥 Erreur API recettes :", err);

    res.json({
      titre: "Recette improvisée",
      temps: "30 min",
      difficulte: "Facile",
      etapes: [
        "Préparez vos ingrédients.",
        "Cuisinez librement selon votre inspiration.",
        "Ajoutez sel, poivre et aromates.",
        "Servez avec plaisir."
      ]
    });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Mon Régime démarré`);
  console.log(`📍 Accès à l'app : http://localhost:3000/mon_regime.html`);
  console.log(`🧠 IA locale : Llama 3.1 via Ollama\n`);
});
