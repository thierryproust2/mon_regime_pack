require('dotenv').config({ path: './mon_regime_pack.env' });
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Fonction pour extraire du JSON même si l'IA parle autour
function extractJSON(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  const jsonText = text.substring(first, last + 1);
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return null;
  }
}

// Route API IA
app.post('/api/gen_recette', async (req, res) => {
  try {
    const { jour, repas, ingredients } = req.body;

    console.log("📥 Requête reçue :", { jour, repas, ingredients });

    const prompt = `
Tu es un chef cuisinier professionnel.
Génère UNIQUEMENT un JSON strict pour une recette.

CONTRAINTES IMPORTANTES :
- FORMAT STRICT :
{
  "titre": "",
  "temps": "",
  "difficulte": "",
  "etapes": ["", "", "", ""]
}
- ATTENTION : "etapes" doit être une LISTE DE TEXTES, PAS une liste d'objets.
- PAS de descriptions structurées
- PAS d'objets dans les étapes
- 5 à 8 étapes maximum
- Niveau débutant
- Utiliser ces ingrédients : ${ingredients}
- PAS DE TEXTE en dehors du JSON.
`;

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        messages: [{ role: "user", content: prompt }],
        stream: false
      })
    });

    const data = await response.json();
    const content = data.message?.content || "";

    console.log("🧠 Réponse IA brute :\n", content);

    // Extraction robuste
    const recette = extractJSON(content);

    if (!recette) {
      throw new Error("Impossible de trouver du JSON dans la réponse");
    }

    console.log("✅ Recette extraite :", recette.titre);

    res.json(recette);

  } catch (err) {
    console.error("💥 Erreur IA :", err);

    res.json({
      titre: "Recette improvisée",
      temps: "30min",
      difficulte: "Facile",
      etapes: [
        "Préparez vos ingrédients",
        "Cuisinez selon votre inspiration",
        "Assaisonnez selon vos goûts",
        "Servez avec plaisir"
      ]
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Mon Régime démarré`);
  console.log(`📍 URL: http://localhost:3000/mon_regime.html`);
  console.log(`🧠 IA locale : Llama 3.1 via Ollama\n`);
});
