# Guide d'Accessibilité Couleur : Pourquoi et Comment Tester

Un guide pratique pour comprendre l'accessibilité des couleurs dans vos projets web

## Qui est concerné ? Les chiffres qui comptent

### Population affectée globalement

**300 millions de personnes** dans le monde vivent avec des déficiences de perception des couleurs - soit l'équivalent de la population des États-Unis.

**1 homme sur 12 (8%)** et **1 femme sur 200 (0,5%)** sont daltoniens, avec des variations selon les origines ethniques :

- Populations caucasiennes : jusqu'à 8% des hommes
- Populations asiatiques : 4-6,5% des hommes

### Au-delà du daltonisme

**285 millions de personnes** dans le monde ont une déficience visuelle (39 millions aveugles, 246 millions malvoyantes), incluant :

- **Basse vision** : difficulté à voir les détails, sensibilité au contraste
- **Sensibilité à la lumière** (photophobie)
- **Champ visuel réduit**

### Impact en classe et entreprise

**40% des élèves daltoniens** quittent l'école sans savoir qu'ils le sont. Dans une classe de 25 élèves, au moins 1 aura des difficultés avec les couleurs.

**86,4% des sites web** ont un contraste insuffisant selon une étude sur 1 million de pages d'accueil.

---

## Les Standards Actuels : WCAG 2.1

### Niveaux de conformité

**AA (Minimum légal)** :

- Texte normal : ratio **4,5:1**
- Gros texte (18pt+ ou 14pt+ gras) : ratio **3:1**
- Éléments non-textuels (boutons, icônes) : ratio **3:1**

**AAA (Renforcé)** :

- Texte normal : ratio **7:1**
- Gros texte : ratio **4,5:1**

### Calcul du contraste

```text
Ratio = (L1 + 0.05) / (L2 + 0.05)
```

Où L1 et L2 sont les luminances relatives des couleurs claire et foncée.

---

## Le Futur : WCAG 3.0 et APCA

### Pourquoi changer ?

Les études montrent que WCAG 2 échoue dans 49% des cas : des couleurs lisibles sont rejetées, des couleurs illisibles sont acceptées.

**Problèmes de WCAG 2.1** :

- Ne considère pas la taille/poids des polices
- Même résultat pour "texte sur fond" et "fond sur texte"
- Imprécis pour les couleurs sombres (plus sombre que #a0a0a0)

### APCA : L'algorithme du futur

APCA utilise un score de 0 à 105+ au lieu des ratios :

- **15** : Minimum pour éléments non-textuels
- **60** : Minimum pour texte normal (équivalent 4,5:1)
- **75** : Niveau recommandé pour texte normal
- **90** : Préféré pour texte fluide

**Avantages APCA** :

- Prend en compte taille et poids de police
- Résultats différents selon sens foreground/background
- Plus fidèle à la perception humaine

---

## Types de Déficiences Couleur

### Daltonisme rouge-vert (99% des cas)

- **Deutéranomalie** (5% population) : difficulté avec le vert
- **Protanomalie** (1% population) : difficulté avec le rouge
- **Deutéranopie/Protanopie** (1% chacun) : absence de cônes

### Daltonisme bleu-jaune (rare)

- **Tritanomalie/Tritanopie** : difficulté bleu/jaune

### Monochromatie (extrêmement rare)

- **Achromatopsie** : vision uniquement en nuances de gris

---

## Impact Business et Légal

### Coût de l'inaccessibilité

L'inaccessibilité numérique représente un manque à gagner énorme pour les entreprises. **73% des personnes handicapées** rencontrent des barrières sur plus d'un quart des sites web qu'elles visitent, et **75% d'entre elles** abandonnent l'achat face à un site inaccessible.

**Au niveau mondial** : 2,2 milliards de personnes ont une déficience visuelle, représentant 411 milliards $ de pertes de productivité annuelles.

**En France** : 1,7 million de personnes sont atteintes d'un trouble de la vision (207 000 aveugles + 932 000 malvoyants moyens). Seuls **10% des sites internet** sont accessibles aux personnes aveugles et malvoyantes.

### Obligations légales

- **ADA** (États-Unis) : sites web considérés comme "lieux publics"
- **Directive européenne accessibilité web**
- **RGAA** (France) : Secteur public + entreprises >250M€ obligatoire, PME/TPE recommandé - Sanctions jusqu'à 50 000€ (ordonnance n°2023-859 du 6 septembre 2023, applicable depuis janvier 2024)

---

## Tests Pratiques

### Outils recommandés

**En ligne** :

- WebAIM Contrast Checker
- Accessible Colors
- Stark (plugin Figma)

**Simulation daltonisme** :

- Color Oracle (macOS)
- Colorblind Web Page Filter
- NoCoffee (extension navigateur)

### Notre outil automatisé

Génère un rapport Excel complet testant :

- ✅ Toutes combinaisons de votre palette
- ✅ Tests avec noir/blanc de référence
- ✅ WCAG 2.1 (AA/AAA) + APCA (futur standard)
- ✅ 8 types de daltonisme simultanément

---

## Bonnes Pratiques

### Design inclusif

- **Ne jamais** utiliser uniquement la couleur pour transmettre l'information
- Ajouter icônes, textures, soulignements
- Tester sur différents écrans et luminosités
- Viser AAA quand possible, AA minimum

### Éviter les écueils

- Interfaces trop colorées et encombrées
- Combinaisons rouge-vert problématiques
- Texte gris sur fond blanc (très courant mais souvent insuffisant)
- Désactiver le zoom navigateur

---

## Conclusion

L'accessibilité couleur n'est pas un "nice-to-have" mais une **nécessité business et éthique**. Avec 4,5% de la population concernée par le daltonisme et des millions d'autres par diverses déficiences visuelles, ignorer l'accessibilité revient à exclure une partie significative de vos utilisateurs.

**L'accessibilité profite à tous** : un site accessible est plus facile à utiliser pour tout le monde, pas seulement pour les personnes en situation de handicap.

Guide compilé à partir des standards WCAG 2.1, recherches APCA et statistiques internationales - Septembre 2025
