# **A LIRE EN PREMIER — BackBox (Bacbox) • Source of Truth (Freeze MVP0)**

Ce dossier regroupe la **source de vérité** du **MVP0 de BackBox (Bacbox App)** : un assistant guidé pour aider les élèves de Première à construire un **commentaire composé (EAF)**, via une progression structurée (P1 → P4), avec mini-récaps et un récap final.

Objectif : rendre le projet **compréhensible, implémentable et testable** sans interprétations hasardeuses.

---

## **1\) Comment lire (ordre recommandé)**

1. **PRD Lite (Kernel Produit)** — comprendre la promesse et le périmètre.  
2. **State & Flow Map (1 page)** — voir le parcours utilisateur et les états en un coup d’œil.  
3. **Contract Spec (CANON)** — comprendre les règles système et les comportements obligatoires.  
4. **Figma Visual Truth** — voir les écrans, les états UI, la microcopy et les messages.  
5. **Acceptance Tests (GWT)** — vérifier que tout est prouvable (cas nominaux \+ cas tordus).  
6. **Decision Log & Changelog (ADR-lite)** — garder le projet cohérent dans le temps.

Ensuite seulement : **Annexe / Patch Pack “Repo-ready”** (guide d’exécution) \+ archives techniques.

---

## **2\) Ce qui est “CANON” vs “Référence”**

### **CANON (ce qui doit gagner en cas de doute)**

* **Contract Spec (Artifact 3\)** : règles, invariants, erreurs, quotas, comportements.  
* **Acceptance Tests (GWT)** : ce qui doit passer pour considérer que le produit est “ok”.  
* **Decision Log (ADR-lite)** : décisions verrouillées et changements assumés.  
* **Figma Visual Truth** : vérité UI (écrans, états, microcopy).

Règle simple : si une info contredit le CANON, on corrige la source non-canon **ou** on fait une entrée dans le Decision Log.

### **Référence (utile mais non bloquant)**

* **PRD Lite** et **State & Flow Map** : super importants pour comprendre, mais parfois moins “enforceables” que le contrat/tests.  
* **Annexe / Patch Pack “Repo-ready”** : accélérateur d’implémentation.  
* **Readiness Audit** : audit de complétude.  
* ZIPs (template/Docs) : références techniques.

---

## **3\) Principes fondamentaux (à ne pas oublier)**

### **A) Respect de Supastarter**

* On **réutilise** les patterns du kit (auth/session, routing, config, packages, conventions).  
* On évite de “combattre le framework”.  
* Si un choix est possible : prendre **le chemin le plus aligné Supastarter**.

### **B) Patch-size uniquement**

* **Une PR \= un sujet**.  
* Pas de refactor “pour faire propre”.  
* Préférer “ajouter un garde-fou / une vérif” plutôt que redesign.

### **C) Pas de secrets**

* Ne jamais demander / committer de valeurs sensibles.  
* Si une variable d’environnement est nécessaire, demander **le nom attendu**, pas la valeur.

### **D) Le système doit être testable**

* Le **contrat** et les **GWT** doivent rester vrais.  
* Les erreurs et états “anti-panique” doivent être cohérents UI ↔ contrat.

---

## **4\) Décisions verrouillées (rappel)**

* **ORM : Prisma**  
* **Paiements : LemonSqueezy**

Si tu vois des traces “Stripe” (héritage template / écran / wording), ne pas déduire que le projet bascule sur Stripe : on suit la décision verrouillée et on note la divergence dans le Decision Log si nécessaire.

---

## **5\) Contenu du dossier (à quoi ça sert)**

### **1\) PRD Lite — “Kernel Produit”**

* Pitch, cible, promesse, périmètre, garde-fous pédagogiques.  
* Modèle d’accès : **trial** puis premium.

### **2\) State & Flow Map (1 page)**

* Parcours : accès → dashboard → création projet → P1→P4 → final/export.  
* États (trial actif/consommé, paid, etc.).

### **3\) Contract Spec (CANON)**

* Entités, endpoints, codes d’erreur, quotas/rate-limit.  
* Invariants clés : IDs stables, comportements obligatoires, pas de reset “magique”, etc.

### **4\) Acceptance Tests (GWT)**

* Scénarios anti-ambiguïté : accès, trial, ownership, quotas, rate-limit, erreurs IA, export…

### **5\) Figma Visual Truth**

* Écrans, états UI (loading/empty/error/disabled), microcopy.  
* Mapping UI ↔ erreurs contrat (messages utiles, “anti-panique”).

### **6\) Decision Log & Changelog (ADR-lite)**

* Quand on change une règle, on l’écrit ici : décision, pourquoi, impact, artefacts concernés.

### **Annexe — Patch Pack “Repo-ready”**

* Guide d’implémentation “jetable mais utile” : repères de fichiers, conventions, squelette.  
* En cas de divergence : **le Contrat gagne**.

### **Readiness Audit (PDF)**

* Vérifie la complétude et liste les patchs de solidification.

### **Archives techniques (ZIP)**

* Template base \+ docs Next.js offline.

---

## **6\) Mode d’emploi pour travailler avec Claude / Cursor (recommandé)**

Quand tu délègues un bout de travail :

1. Donne **le but** (ce qui doit être vrai à la fin), pas une recette.  
2. Rappelle les **garde-fous** : Supastarter, patch-size, 1 PR \= 1 sujet.  
3. Demande un rendu structuré :  
   * Plan court (3–8 bullets)  
   * Prompt “agent Cursor” borné  
   * Commandes à exécuter  
   * Triage minimal si ça casse  
   * Definition of Done

---

## **7\) Definition of Done (MVP0 — au niveau docs)**

* Le parcours P1→P4 \+ récap final est défini (Flow \+ Figma).  
* Le contrat est “enforceable” (erreurs/quotas/règles claires).  
* Les tests GWT couvrent les cas importants.  
* Les décisions verrouillées sont écrites et à jour.

---

*Dernière note : si tu hésites, reviens au trio “Flow → Contrat → Tests”. C’est le moyen le plus sûr d’éviter la dérive.*

