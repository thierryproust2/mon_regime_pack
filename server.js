const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const HF_MODEL = process.env.HF_MODEL || 'google/flan-t5-large'; // creative instruct model (relatively capable)
const HF_TOKEN = process.env.HF_TOKEN || ''; // optional - if not provided the server will try anonymous request

app.post('/api/gen_recette', async (req, res) => {
  try {
    const { jour, repas, ingredients } = req.body;
    if (!ingredients) return res.status(400).json({ error: 'Aucun ingrédient fourni' });

    const prompt = `Tu es un chef cuisinier créatif. Crée une recette simple, détaillée et savoureuse avec ces ingrédients: ${ingredients}.
Réponds uniquement en JSON avec la structure:
{"titre":"", "temps":"", "difficulte":"", "etapes":["...","..."]}`;

    // Hugging Face inference API endpoint
    const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

    const headers = { 'Content-Type': 'application/json' };
    if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`;

    const body = JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300 } });

    const hfResp = await fetch(url, { method: 'POST', headers, body });
    const text = await hfResp.text();

    // If unauthorized or blocked, return helpful message
    if (hfResp.status === 401 || hfResp.status === 403) {
      return res.status(403).json({
        error: 'Accès refusé par Hugging Face. Vous pouvez créer gratuitement un token Hugging Face et le placer dans HF_TOKEN (instructions dans README).',
        hf_status: hfResp.status,
        hf_text: text
      });
    }

    // Many HF models return text or JSON - try to find JSON inside
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recette = JSON.parse(jsonMatch[0]);
      return res.json(recette);
    }

    // If not JSON, try to parse the whole text as JSON
    try {
      const parsed = JSON.parse(text);
      // Some models return an array of text chunks
      if (Array.isArray(parsed) && parsed.length>0 && parsed[0].generated_text) {
        const gen = parsed[0].generated_text;
        const match2 = gen.match(/\{[\s\S]*\}/);
        if (match2) return res.json(JSON.parse(match2[0]));
        return res.status(500).json({ error: 'Réponse du modèle non interprétable', raw: gen });
      }
    } catch(e){ /* ignore */ }

    // Fallback: return raw text to help debugging
    return res.status(500).json({ error: 'Impossible d'extraire un JSON de la réponse du modèle', raw: text });

  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur interne', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
