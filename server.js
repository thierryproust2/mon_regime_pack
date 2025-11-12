require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Sert les fichiers HTML, CSS, JS

// Variables d'environnement
const HF_MODEL = process.env.HF_MODEL || 'google/flan-t5-large';
const HF_TOKEN = process.env.HF_TOKEN || '';

// Route API pour générer une recette
app.post('/api/gen_recette', async (req, res) => {
  try {
    const { jour, repas, ingredients } = req.body;
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Aucun ingrédient fourni' });
    }

    const prompt = `Tu es un chef cuisinier créatif. Crée une recette simple, détaillée et savoureuse avec ces ingrédients: ${ingredients}.
Réponds uniquement en JSON avec la structure:
{"titre":"", "temps":"", "difficulte":"", "etapes":["...","..."]}`;

    const url = `https://api-inference.huggingface.tech/models/${HF_MODEL}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(HF_TOKEN && { Authorization: `Bearer ${HF_TOKEN}` })
    };

    const body = JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 300 }
    });

    const hfResp = await fetch(url, { method: 'POST', headers, body });
    const text = await hfResp.text();

    // Log brut pour débogage
    console.log("Réponse brute Hugging Face :", text);

    // Gestion des erreurs d'accès
    if (hfResp.status === 401 || hfResp.status === 403) {
      return res.status(403).json({
        error: 'Accès refusé par Hugging Face. Vérifiez votre token HF_TOKEN.',
        hf_status: hfResp.status,
        hf_text: text
      });
    }

    // Tentative d'extraction JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recette = JSON.parse(jsonMatch[0]);
        return res.json(recette);
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed[0]?.generated_text) {
        const gen = parsed[0].generated_text;
        const match2 = gen.match(/\{[\s\S]*\}/);
        if (match2) {
          const recette = JSON.parse(match2[0]);
          return res.json(recette);
        }
        return res.status(500).json({ error: 'Réponse du modèle non interprétable', raw: gen });
      }

      return res.status(500).json({ error: "Réponse inattendue du modèle", raw: text });
    } catch (e) {
      console.error("Erreur de parsing JSON :", e.message);
      return res.status(500).json({ error: "Erreur lors de l'analyse de la réponse du modèle", raw: text });
    }

  } catch (err) {
    console.error("Erreur serveur :", err.message);
    res.status(500).json({ error: 'Erreur serveur interne', detail: err.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
