MON_REGIME - Version IA gratuite (Windows 11)
============================================

Contenu du dossier:
- mon_regime.html       --> l'interface (ouvre depuis le navigateur)
- server.js             --> mini-serveur Node.js qui contacte Hugging Face
- package.json          --> dépendances (express, node-fetch)
- lancer_mon_regime.bat --> double-clique pour installer et lancer
- README.txt            --> ce fichier

Principe:
- Le bouton "⭐ Recette IA" envoie la liste d'ingrédients au serveur local (server.js).
- Le serveur appelle un modèle Hugging Face (par défaut: google/flan-t5-large) et demande une recette au format JSON.
- Si Hugging Face accepte des requêtes anonymes pour ce modèle, tout fonctionne sans clé.
- Si Hugging Face bloque (403), vous pouvez créer gratuitement un token Hugging Face et le placer dans la variable d'environnement HF_TOKEN.

Étapes d'installation (facile) :
1) Installer Node.js (LTS) si vous ne l'avez pas :
   - Aller sur https://nodejs.org/ et télécharger "LTS" (Windows Installer) puis l'installer.

2) Dézippez le dossier quelque part (ex: C:\Users\TonNom\mon_regime_pack)

3) Double-cliquez sur "lancer_mon_regime.bat".
   - Le script lancera `npm install` (installe les dépendances) puis ouvrira votre navigateur sur la page.
   - Enfin le serveur local démarrera sur http://localhost:3000

4) Utilisation :
   - Glissez des aliments sur un repas, puis cliquez sur ⭐ Recette IA pour générer une recette.
   - Une fenêtre modale affichera la recette renvoyée par le modèle.

Que faire si ça ne marche (403 ou erreur) :
- Créez un compte gratuit sur Hugging Face : https://huggingface.co/join
- Générez un token (Settings → Access Tokens → New token, type: "Read")
- Ajoutez votre token de l'une des deux façons :
  a) Éditez le fichier "lancer_mon_regime.bat" et dé-commentez la ligne:
     set HF_TOKEN=VOTRE_TOKEN_ICI
  b) Ou, dans une console PowerShell avant de lancer, exécutez:
     $env:HF_TOKEN='VOTRE_TOKEN_ICI'
- Relancez "lancer_mon_regime.bat".

Conseils :
- Le modèle par défaut est "google/flan-t5-large". Il est un bon compromis création/détails.
- Si vous voulez plus de créativité, vous pouvez remplacer HF_MODEL dans server.js par un autre modèle.
- Pour agrandir la liste d'aliments, éditez le bloc ALIMENTS dans mon_regime.html (format: "nom": {emoji, calories, quantite, unite, categorie},).

Support :
- Si tu veux, je peux adapter le serveur pour utiliser un modèle spécifique que je recommande (plus "chef") ou simplifier encore l'interface.

Bonne utilisation — dis-moi quand tu veux que je t'envoie le dossier prêt à télécharger !
