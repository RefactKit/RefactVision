# RefactKit 🚀 — Boilerplate SaaS Multi-Locataire

![Edition](https://img.shields.io/badge/edition-Community-10b981?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?logo=react&style=flat-square)
![Framework](https://img.shields.io/badge/TanStack-Start-orange?style=flat-square)
![Engine](https://img.shields.io/badge/Nitro-v3-green?style=flat-square)
![Auth](https://img.shields.io/badge/Better--Auth-1.6+-purple?style=flat-square)
![DB](https://img.shields.io/badge/Drizzle-ORM-yellow?style=flat-square)
![Deploy](https://img.shields.io/badge/Vercel-Ready-black?logo=vercel&style=flat-square)

> **RefactKit** est un boilerplate SaaS full-stack prêt pour la production — interface utilisateur (UI) front-end *et* API back-end scalable — construit avec **React 19** et l'**écosystème TanStack** (Start, Router, Query, Form). Il intègre l'authentification, la gestion des organisations, le contrôle d'accès basé sur les rôles (RBAC), l'internationalisation, et un système de design premium — le tout relié avec un typage fort de bout en bout et sans aucun compromis sur les performances.

> [!NOTE]
> **RefactKit Community Edition** — gratuit et open-source sous licence MIT. Créez avec, apprenez-en, partagez ce que vous concevez. Les contributions, les rapports de bugs et les vitrines (showcases) sont chaleureusement accueillis. 🙌

## 🆓 Communauté (Gratuit)
[![Open Source](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![RefactKit](https://img.shields.io/badge/RefactKit-Boilerplate-blue)](https://github.com/yourrepo/refactkit)

| Fonctionnalité | Description |
|---------|-------------|
| 🔑 Gestion des Utilisateurs | Voir, éditer & gérer tous les utilisateurs |
| 📋 Journaux d'Audit | Historique complet des événements d'authentification |
| 🛡️ Suivi de Sécurité | Détection des menaces en temps réel |
| 🗄️ Suivi de Base de données | Tableau de bord santé BDD en direct |
| 🏢 Organisations | Multi-locataire (Multi-tenant) + gestion d'équipe |
| 🎨 Personnalisation | Thèmes personnalisés pour les pages d'auth |
| 🔄 Flux de Logs | Envoyez les logs vers vos outils d'analyse |

---

**Table des matières**

- [🌟 Introduction](#-introduction)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🛠️ Stack Technique](#️-stack-technique)
- [🏗️ Architecture](#️-architecture)
- [🔒 Authentification & Sécurité](#-authentification--sécurité)
- [👥 Rôles & RBAC](#-rôles--rbac)
- [💻 Architecture Frontend](#-architecture-frontend)
- [⚙️ Architecture Backend](#️-architecture-backend)
- [🗄️ Base de données & Schéma](#️-base-de-données--schéma)
- [🌐 Internationalisation](#-internationalisation)
- [📝 Formulaires & Système de Design](#-formulaires--système-de-design)
- [🧪 DevOps, Observabilité & Tests](#-devops-observabilité--tests)
- [💳 Paiements & Facturation (Pro)](#-paiements--facturation-pro)
- [🤖 Développement Assisté par l'IA](#-développement-assisté-par-lia)
- [📄 Licence](#-licence)

---

## 🌟 Introduction

**RefactKit** est conçu pour les développeurs créant des plateformes B2B, des produits SaaS B2C, ou des outils internes nécessitant une isolation des espaces de travail. Chaque donnée circule à travers un contexte d'organisation, faisant de la séparation des locataires (tenants) une priorité architecturale de premier plan plutôt qu'une réflexion après coup.

### Philosophie Fondamentale

| Principe | Comment il est appliqué |
|---|---|
| **Priorité au Multi-locataire** | Chaque table de données inclut `organizationId`. Les fonctions serveur valident l'appartenance au locataire avant toute requête. |
| **Typage Fort Partout** | TypeScript en mode strict, requêtes SQL typées avec Drizzle, validation à l'exécution avec Zod, routes typées avec TanStack. |
| **Accessible par Défaut** | Les primitives de Base UI assurent la conformité WAI-ARIA. Les tokens de couleurs sémantiques évitent les valeurs en dur. |
| **Sécurité conforme OWASP** | Anti-énumération, limitation de taux (rate limiting), sessions chiffrées JWE, journaux d'audit — tout est intégré. |
| **Déploiement Universel** | Le moteur Nitro v3 cible Vercel, Cloudflare, Node.js, et AWS avec un seul build. |

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** 20+
- **pnpm** (recommandé) — `npm install -g pnpm`
- Compte **Supabase** avec un projet PostgreSQL
- Compte **Resend** pour les emails transactionnels

### 1. Cloner & Installer

```bash
git clone https://github.com/your-org/refactkit-multitenancy.git
cd refactkit-multitenancy
pnpm install
```

### 2. Variables d'Environnement — Où les trouver

Copiez `.env.example` vers `.env.local`, puis suivez les étapes ci-dessous pour récupérer chaque variable.

---

#### 🗄️ Supabase — `DATABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

1. Créez un projet gratuit sur **[supabase.com](https://supabase.com)** → **New Project**
2. Une fois créé, allez dans **Project Settings → Database**
3. Descendez jusqu'à **Connection string** → sélectionnez l'onglet **URI** → copiez la chaîne **Transaction pooler** (port `6543`) → ceci est votre `DATABASE_URL`

```env
# ✅ Utilisez le port 6543 (Transaction pooler) — requis pour serverless/Vercel
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

4. Allez dans **Project Settings → API**
   - Copiez **Project URL** → `VITE_SUPABASE_URL`
   - Copiez la clé secrète **`service_role`** → `SUPABASE_SERVICE_ROLE_KEY`

```env
VITE_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> [!CAUTION]
> La clé `SUPABASE_SERVICE_ROLE_KEY` contourne la sécurité au niveau des lignes (RLS). **Ne l'exposez jamais côté client.** Gardez-la uniquement côté serveur et ne la préfixez jamais par `VITE_`.

📖 Docs Supabase : [Chaînes de connexion DB](https://supabase.com/docs/guides/database/connecting-to-postgres) · [Clés API](https://supabase.com/docs/guides/api/api-keys)

---

#### 📧 Resend — `RESEND_API_KEY`, `EMAIL_FROM`

1. Créez un compte gratuit sur **[resend.com](https://resend.com)**
2. Allez dans **API Keys** → **Create API Key** → copiez la clé

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="RefactKit <noreply@yourdomain.com>"
```

3. Vérifiez votre domaine d'expédition sous **Domains** → ajoutez les enregistrements DNS fournis (SPF, DKIM) chez votre fournisseur de domaine.

> [!NOTE]
> En développement, vous pouvez utiliser la sandbox de Resend — aucune vérification de domaine requise. Pour la production, un domaine vérifié est obligatoire pour éviter que vos emails ne finissent dans les spams.

📖 Docs Resend : [Démarrer](https://resend.com/docs/introduction) · [Domaines](https://resend.com/docs/dashboard/domains/introduction)

---

#### 🔐 Better Auth — `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

Générez un secret fort avec :

```bash
openssl rand -base64 32
```

```env
BETTER_AUTH_SECRET="collez-le-résultat-ici"
BETTER_AUTH_URL="http://localhost:3000"        # En production : https://votre-domaine.com
```

> [!WARNING]
> Renouveler le `BETTER_AUTH_SECRET` en production invalide **toutes les sessions existantes**. Planifiez tout renouvellement de secret en conséquence.

##### 🧭 Tableau de Bord Better Auth (Optionnel)

RefactKit inclut le plugin `dash()` de `@better-auth/infra`, qui expose un panneau d'administration intégré pour surveiller les utilisateurs, les sessions et les organisations.

| Mode | Comment y accéder | Cas d'usage |
|---|---|---|
| **Dev Local** | `http://localhost:3000/api/auth/dashboard` | Inspecter les sessions pendant le développement |
| **Auto-hébergé** (Infra) | Déployez `@better-auth/infra` sur votre propre serveur | Contrôle total, sans tiers |
| **Cloud Better Auth** | [better-auth.com](https://better-auth.com) | Tableau de bord géré, aucune configuration requise |

```env
# Requis pour accéder au panneau /api/auth/dashboard
BETTER_AUTH_API_KEY="ba_xxxxxxxxxxxxxxxxxxxxxxxx"
```

📖 Docs Better Auth : [Plugin Dashboard](https://better-auth.com/docs/plugins/admin) · [better-auth/infra](https://github.com/better-auth/infra)

---

#### Référence Complète `.env`

| Variable | Requise | Où la trouver |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Supabase → Project Settings → Database → Transaction pooler URI (port 6543) |
| `BETTER_AUTH_SECRET` | ✅ | Générer avec `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | URL publique de votre app (`http://localhost:3000` en dev) |
| `RESEND_API_KEY` | ✅ | Resend → API Keys |
| `EMAIL_FROM` | ✅ | Votre adresse d'expédition vérifiée (ex: `App <noreply@yourdomain.com>`) |
| `VITE_SUPABASE_URL` | ✅ | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase → Project Settings → API → Clé `service_role` |
| `BETTER_AUTH_API_KEY` | ⚪ Optionnel | Tableau de bord Better Auth → API Keys (seulement pour le panneau d'admin) |
| `OPENAPI_NONCE` | ⚪ Optionnel | Nonce statique pour le CSP de l'OpenAPI |
| `VITE_APP_URL` | ⚪ Optionnel | Surcharge l'URL de base pour le client d'auth (par défaut relatif) |

---

### 3. Configuration de la Base de Données

```bash
# Envoyer le schéma à Supabase (à lancer après chaque modification de schéma)
npx drizzle-kit push

# (Optionnel) Ouvrir le navigateur visuel de base de données sur https://local.drizzle.studio
npx drizzle-kit studio
```

📖 Docs Drizzle : [drizzle-kit push](https://orm.drizzle.team/docs/drizzle-kit-push) · [Guide Supabase + Drizzle](https://supabase.com/docs/guides/database/drizzle)

### 4. Stockage Supabase

RefactKit nécessite deux buckets publics : `avatars` (pour les profils) et `app-images` (pour le module galerie).

Dans votre **Tableau de Bord Supabase → SQL Editor**, exécutez :

```sql
-- Créer les buckets (lecture publique)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('app-images', 'app-images', true)
ON CONFLICT (id) DO NOTHING;

-- Autoriser l'accès public en lecture pour les deux buckets
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('avatars', 'app-images'));
```

> [!TIP]
> Vous pouvez aussi créer ces buckets visuellement dans **Supabase Dashboard → Storage → New bucket**. Assurez-vous que les deux sont définis sur **Public** et ajoutez la même politique SELECT.

### 5. Peupler les Images de la Galerie (Optionnel)

Pour tester le module galerie, vous pouvez utiliser le script fourni pour uploader 25 images d'exemple :

```bash
# Définissez d'abord un ID d'Organisation valide dans votre .env
TEST_ORG_ID="votre-org-id" 

# Exécutez le script d'upload
node scripts/upload-images.js
```

### 6. Lancement

```bash
pnpm dev    # → http://localhost:3000
```

---
## 🛠️ Stack Technique

### Framework Principal
- **Exécution** : Node.js 22+  
- **Build/Serveur** : Nitro v3  
- **Framework UI** : React 19  
- **Système de Types** : TypeScript 5.x  

### Authentification
- **Fournisseur d'Identité** : Better Auth (auto-hébergé)  
- **Adaptateur Base de données** : Supabase PostgreSQL  
- **Stockage de Session** : Cookies chiffrés (JWE)  

### Couche Données
- **Base de données** : PostgreSQL (Supabase)  
- **ORM/Constructeur de requêtes** : Drizzle ORM  
- **Stockage** : Supabase Storage (Compatible S3)  

### Formulaires & Gestion d'État
- **Constructeur de Formulaire** : TanStack Form  
- **Validation** : Zod + Superforms  
- **État Client** : TanStack Query  

### Composants UI
- **Primitives de Base** : shadcn/ui basé sur Base UI — thèmes via presets, totalement personnalisable
- **Système d'Icônes** : Phosphor Icons + Lucide React
- **Tokens de Design** : Variables CSS via `@theme` (Tailwind CSS v4)

### Routage & Navigation
- **Routeur Typé** : TanStack Router  

### Infrastructure & DevOps
- **Déploiement** : Vercel (principal), Cloudflare, Node.js, AWS  
- **Gestionnaire de Paquets** : pnpm  
- **Qualité du Code** : Biome (lint/format)  
- **Tests** : Vitest (unitaires), Playwright (E2E)  

## 🏗️ Architecture

### Conception de Haut Niveau (HLD)

```mermaid
graph TB
    subgraph Client["Client — Navigateur"]
        UI["React 19 UI"]
        Router["TanStack Router"]
        Query["TanStack Query Cache"]
        Form["TanStack Form"]
    end

    subgraph Server["Serveur — Nitro v3"]
        SSR["SSR / Hydratation"]
        SF["Fonctions Serveur<br/>(createServerFn)"]
        Auth["Middleware<br/>Better Auth"]
        Email["Service Email<br/>Resend"]
    end

    subgraph Data["Couche Données"]
        DB["PostgreSQL<br/>(Supabase)"]
        S3["Supabase Storage<br/>(Compatible S3)"]
        ORM["Drizzle ORM"]
    end

    UI --> Router
    Router --> Query
    Query --> SF
    Form --> SF
    SF --> Auth
    Auth --> ORM
    ORM --> DB
    SF --> S3
    Auth --> Email
    SSR --> SF
    SSR --> UI
```

### Conception de Bas Niveau (LLD) — Interaction des Modules

```mermaid
graph LR
    subgraph Routes["src/routes/"]
        AuthRoutes["_auth/<br/>login, signup,<br/>forgot-password"]
        AppRoutes["_app/<br/>dashboard, settings"]
        OrgRoutes["$slug/<br/>dashboard, members,<br/>gallery, settings"]
    end

    subgraph ServerFns["src/server/"]
        AuthFns["auth-fns.ts"]
        OrgFns["org-fns.ts"]
        DashFns["dashboard-fns.ts"]
        StorageFns["storage-fns.ts"]
        GalleryFns["gallery-fns.ts"]
        QueryKeys["query-keys.ts"]
    end

    subgraph Core["lib/"]
        AuthConfig["auth.ts<br/>(Config Better Auth)"]
        AuthClient["auth-client.ts<br/>(Client Navigateur)"]
        EmailLib["email.ts<br/>(Resend)"]
        EnvLib["env.ts"]
    end

    subgraph DB["db/"]
        Schema["schema.ts"]
        DBConn["index.ts<br/>(Pool postgres.js)"]
    end

    AuthRoutes --> AuthFns
    AppRoutes --> OrgFns
    OrgRoutes --> DashFns & GalleryFns & StorageFns
    OrgFns --> AuthConfig
    AuthFns --> AuthConfig
    AuthConfig --> EmailLib
    AuthConfig --> DBConn
    OrgFns --> DBConn
    DashFns --> DBConn
    DBConn --> Schema
```

### Cycle de vie des requêtes — Flux SSR + Hydratation

```mermaid
sequenceDiagram
    participant B as Navigateur
    participant N as Nitro v3 (SSR)
    participant R as TanStack Router
    participant SF as Fonction Serveur
    participant BA as Better Auth
    participant DB as PostgreSQL

    B->>N: GET /organizations/acme/dashboard
    N->>R: Correspond à la route → _app/$slug/dashboard
    R->>R: beforeLoad → vérifier la session
    R->>SF: loader → getOrgBySlug("acme")
    SF->>BA: getSession(headers)
    BA->>DB: SELECT session WHERE token = ?
    DB-->>BA: Session { userId, activeOrgId }
    BA-->>SF: Authentifié ✅
    SF->>DB: SELECT org WHERE slug = "acme"
    SF->>DB: SELECT member WHERE orgId AND userId
    DB-->>SF: Données de l'Org + rôle
    SF-->>R: { org, role }
    R->>R: ensureQueryData → populer le cache
    N-->>B: HTML Complet + cache de requête déshydraté
    B->>B: Hydratation → React 19 prend le relais
    B->>B: TanStack Query utilise les données en cache (aucun refetch)
```

### Structure des Dossiers

```
RefactKit-multitenancy/
├── db/
│   ├── schema.ts              # Source unique de vérité — tables & relations
│   └── index.ts               # Pool de connexion postgres.js (Pooler Supabase)
├── lib/
│   ├── auth.ts                # Config Better Auth (RBAC, rôles dynamiques, hooks)
│   ├── auth-client.ts         # Client auth navigateur (plugin organizationClient)
│   ├── email.ts               # Service d'email transactionnel Resend
│   ├── env.ts                 # Aides pour les variables d'environnement
│   └── supabase.ts            # Client Supabase pour le stockage
├── src/
│   ├── components/
│   │   ├── dashboard/         # Sidebar, Navbar, Fil d'Ariane
│   │   ├── settings/          # Compte, Sécurité, Apparence
│   │   │   └── roles/         # Composant de matrice RBAC dynamique
│   │   ├── projects/          # Composants de gestion de projets
│   │   ├── shared/            # Header, AuthShell, UI partagée
│   │   └── ui/                # Primitives Base UI + Shadcn (Bouton, Input, Checkbox...)
│   ├── i18n/
│   │   ├── context.tsx        # Fournisseur de contexte React
│   │   ├── locales/           # en, fr, es, pt, ar... (12 langues)
│   │   └── index.ts           # Détection de locale & persistance
│   ├── routes/
│   │   ├── __root.tsx         # Layout principal (fournisseurs, meta, polices)
│   │   ├── index.tsx          # Page d'accueil (Landing page)
│   │   ├── _auth/             # Public : login, signup, forgot/reset-password
│   │   ├── _app/              # Protégé : coquille dashboard, paramètres
│   │   │   └── organizations/
│   │   │       └── $slug/     # Org : dashboard, membres, rôles, galerie, paramètres
│   │   ├── api/auth/          # Gestionnaire de routes API Better Auth
│   │   └── onboarding.tsx     # Flux de configuration d'espace de travail
│   ├── server/
│   │   ├── auth-fns.ts        # Fonctions d'aide pour la session & auth
│   │   ├── org-fns.ts         # CRUD organisations & membres
│   │   ├── project-fns.ts     # Logique de gestion de projets
│   │   ├── storage-fns.ts     # Upload de fichier Supabase (serveur uniquement)
│   │   └── query-keys.ts      # Fabriques d'options TanStack Query
│   └── styles/
│       └── globals.css        # Tailwind v4 & tokens globaux
└── package.json               # Scripts & dépendances
```

---

| Couche | Technologie | Version | Rôle dans l'Architecture |
|---|---|---|---|
| **Meta-Framework** | TanStack Start | latest | Framework React full-stack. Fournit le SSR, le routage basé sur les fichiers, les fonctions serveur, et l'hydratation via Nitro v3. |
| **Moteur Serveur** | Nitro v3 | 3.0.x-beta | Moteur de déploiement universel. Alimente le SSR, les fonctions serveur et les routes API. Un seul build cible Vercel, Cloudflare, Node.js. |
| **Framework UI** | React | 19.2+ | Bibliothèque UI principale. Utilise les fonctions de React 19 : Server Functions, Actions, hook `use`. |
| **Routeur** | TanStack Router | latest | Routage type-safe avec gardes `beforeLoad`, chargeurs (loaders), validation des paramètres de recherche et fractionnement du code. |
| **Récupération Données**| TanStack Query | 5.x | Synchronisation de l'état serveur. Modèle de fabrique `queryOptions`, `ensureQueryData` pour populer le cache SSR, refetch automatique en arrière-plan. |
| **Formulaires** | TanStack Form | 1.x | Gestion d'état de formulaires type-safe avec validateurs Zod, suivi d'erreurs par champ, et état de soumission. |
| **Tableaux** | TanStack Table | 8.x | Moteur de tableau headless pour la liste des membres, la grille de la galerie, et les tableaux de données. |
| **Authentification** | Better Auth | 1.6+ | Système d'auth complet : email/mot de passe, OAuth (Google, Microsoft, GitHub, LinkedIn, Twitter), organisations, RBAC, limitation de taux, gestion de session, conformité OWASP. |
| **ORM** | Drizzle ORM | 0.45+ | Constructeur de requêtes SQL type-safe. Schéma-en-tant-que-code avec `pgTable`, requêtes relationnelles, zéro surcharge. |
| **Base de Données** | Supabase (PostgreSQL) | — | PostgreSQL géré avec pool de connexion (port 6543), Sécurité au niveau des Lignes (RLS), et tableau de bord de gestion des données. |
| **Stockage** | Supabase Storage | — | Stockage objet compatible S3 pour avatars, logos, images de galerie. Upload serveur uniquement via la clé service role. |
| **Styles** | Tailwind CSS | v4 | CSS utilitaire avec variables CSS, directives `@theme`, et compilation ultra-rapide via plugin Vite. |
| **Primitives UI** | shadcn/ui (Base UI) | 4.5+ | Composants conformes WAI-ARIA basés sur Base UI. Thèmes via presets — générez et appliquez avec `npx shadcn apply --preset`. Propulsé par Tailwind CSS v4. |
| **Emails** | Resend | — | API d'email transactionnel pour la vérification, la réinitialisation de mot de passe, les invitations, et les alertes de sécurité. |
| **i18n** | Personnalisé (basé sur i18next) | — | 12 langues (EN, FR, ES, PT, AR, AR-MA, BE, DE, HI, ZH, IT, RU). Support RTL. Persistance de la locale par cookie. Détection de la locale côté serveur. |
| **Icônes** | Phosphor Icons + Lucide React | latest | Système d'icônes double — Phosphor pour des icônes expressives et multi-graisses ; Lucide pour des icônes UI nettes. Les deux sont tree-shakeables. |
| **Animations** | Framer Motion | 12.x | Transitions de page fluides et micro-interactions. |
| **Validation** | Zod | 4.x | Validation de type à l'exécution pour les fonctions serveur, inputs de formulaire, et paramètres de recherche. |
| **Qualité du Code** | Biome | 2.4+ | Linter + formatter basé sur Rust. Remplace ESLint + Prettier avec une vitesse 10x supérieure. |
| **Tests Unitaires** | Vitest | 4.x | Tests unitaires/intégration rapides avec JSDOM, React Testing Library, et couverture v8. |
| **Tests E2E** | Playwright | 1.59+ | Tests E2E multi-navigateurs (Chromium, Firefox, WebKit). Démarre automatiquement le serveur dev. |
| **Build** | Vite | 8.x | Outil de build nouvelle génération. Plugins : TanStack Start, React, Tailwind CSS, Nitro. |

### ⚠️ Avertissements sur le Couplage des Dépendances

> [!WARNING]
> **TanStack Start + Nitro v3** : Ces éléments sont fortement couplés. Le paquet `nitro` est fixé à `3.0.x-beta`. Ne lancez **pas** aveuglément `pnpm update` sur `@tanstack/react-start`, `@tanstack/react-router`, ou `nitro` — les discordances de versions font planter le serveur SSR.

> [!WARNING]
> **Better Auth (v1.6+)** : Les mises à jour introduisent souvent de nouvelles colonnes DB (surtout pour le plugin `organization`). Vérifiez toujours le changelog et lancez `npx drizzle-kit push` après chaque mise à jour.

> [!CAUTION]
> **React 19** : Ce boilerplate utilise les fonctionnalités de React 19 (Fonctions Serveur, Actions). N'installez pas de vieilles bibliothèques UI nécessitant React 18, et ne rétrogradez jamais les paquets `react` principaux.

---

## 🔒 Authentification & Sécurité

RefactKit utilise **Better Auth** avec une configuration renforcée, conforme aux normes OWASP. L'état d'authentification et d'organisation est intimement lié — les utilisateurs ne peuvent **jamais** accéder aux données en dehors de leur espace de travail.

### Flux d'Authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant C as Client
    participant BA as Better Auth
    participant DB as Base de données
    participant E as Email Resend

    Note over U,E: Flux d'Inscription (Sign-Up)
    U->>C: Remplit le formulaire
    C->>BA: signUp.email({ name, email, password })
    BA->>DB: Vérifie si l'email existe
    alt Nouvel Utilisateur
        BA->>DB: INSERT utilisateur + compte (hash scrypt)
        BA->>E: Envoie email de vérification
        BA-->>C: 200 OK { user }
        C-->>U: Écran "Vérifiez votre boîte mail"
    else Utilisateur Existant (anti-énumération)
        BA->>E: Envoie alerte "quelqu'un a tenté de s'inscrire"
        BA-->>C: 200 OK (réponse identique)
        C-->>U: Même écran "Vérifiez votre boîte mail"
    end

    Note over U,E: Flux de Connexion (Sign-In)
    U->>C: Remplit le formulaire de login
    C->>BA: signIn.email({ email, password })
    BA->>DB: Vérifie les identifiants (scrypt)
    BA->>DB: CREATE token de session
    BA-->>C: Set-Cookie: session_token (HttpOnly, Secure, SameSite=Lax)
    C-->>U: Redirige vers le dashboard

    Note over U,E: Requêtes Suivantes
    C->>BA: Requête avec cookie
    BA->>BA: Vérifie le cache de cookie JWE (TTL 5 min)
    alt Succès Cache (Cache Hit)
        BA-->>C: Session issue du cache chiffré ⚡
    else Échec Cache (Cache Miss)
        BA->>DB: SELECT session WHERE token = ?
        BA-->>C: Rafraîchit le cache + retourne la session
    end
```

### Check-list de Sécurité OWASP

Chaque élément ci-dessous est implémenté dans `lib/auth.ts` :

| # | Contrôle OWASP | Implémentation | Config |
|---|---|---|---|
| 1 | **Prévention Énumération de Compte** | L'inscription retourne le même code 200 (nouvel/ancien email). `onExistingUserSignUp` notifie le vrai propriétaire. | `requireEmailVerification: true` |
| 2 | **Protection Force Brute** | Limitation de taux sur toutes les requêtes d'auth, sauvegardée en DB (survit aux redémarrages serverless). | `rateLimit: { storage: 'database' }` |
| 3 | **Règles de Limite de Taux** | Connexion: 5/min, Inscription: 3/min, Mot de passe oublié: 3/min. | `customRules: { ... }` |
| 4 | **Cache de Session Chiffré** | Le cache de cookie JWE (AES-256-GCM) évite les requêtes en DB pendant des fenêtres de 5 min. | `cookieCache: { strategy: 'jwe' }` |
| 5 | **Politique de Mot de Passe** | Min 12 carac, max 128 carac (prévient les attaques DoS via bcrypt). | `minPasswordLength / maxPasswordLength` |
| 6 | **Révocation de Session** | Toutes les sessions sont révoquées après réinitialisation du mot de passe. | `revokeSessionsOnPasswordReset: true` |
| 7 | **Expiration du Token de Réinitialisation** | Les tokens expirent en 30 minutes. À usage unique. | `resetPasswordTokenExpiresIn: 60 * 30` |
| 8 | **Journaux d'Audit** | Les `databaseHooks` journalisent la création de session et les changements d'email. | `databaseHooks: { session, user }` |
| 9 | **Suivi d'IP derrière Proxy** | Lit l'IP réelle du client via `x-forwarded-for` (proxy Vercel). | `ipAddress.ipAddressHeaders` |
| 10 | **Protection CSRF** | Multi-couches : validation de l'origine, Fetch Metadata, protection première connexion. | Activé par défaut |
| 11 | **Messages d'Erreurs Génériques** | Connexion/oubli de mot de passe ne révèlent jamais si l'email existe. | Client: `toast.error(l.error)` |
| 12 | **Sécurité Tâches Arrière-plan** | L'envoi d'email utilise `waitUntil` pour prévenir les attaques temporelles. | `backgroundTasks.handler` |

### ✅ Conformité aux Bonnes Pratiques de Sécurité

L'implémentation de l'authentification dans RefactKit suit strictement les **Bonnes Pratiques Officielles Better Auth** et les standards **OWASP ASVS**. Chaque aspect a été durci pour un déploiement prêt pour la production.

- **Limitation de Taux Universelle** : Utilise `storage: 'database'` pour garantir une protection anti force brute sur tous les environnements (Vercel, Netlify, Cloudflare).
- **Chiffrement JWE** : Les cookies de session sont chiffrés en utilisant **AES-256-GCM**, garantissant qu'aucune donnée sensible n'est lisible ou modifiable côté client.
- **Protection OAuth Renforcée** : L'intégration OAuth inclut le chiffrement des tokens (`encryptOAuthTokens`) et une stricte validation des origines (`trustedOrigins`).
- **Prévention Énumération de Compte** : Les flux d'inscription et de récupération de mot de passe sont conçus pour ne jamais confirmer l'existence d'un utilisateur aux attaquants.
- **Journaux d'Audit** : Traçabilité totale via `databaseHooks` pour les événements critiques (création de session, modification d'email).
- **Sécurité des Redirections** : Liste blanche stricte des domaines autorisés (`trustedOrigins`) pour empêcher les redirections malveillantes après la connexion.

| `src/routes/_auth/forgot-password.tsx` | Affiche toujours "vérifiez votre boîte mail" indépendamment de l'existence de l'email |

### ⚡ Bonnes pratiques de Performance & Configuration

- **Requêtes Base de Données Optimisées** : `experimental.joins` est activé dans Better Auth. Cela permet de récupérer les données liées (Utilisateur, Session, Organisation) en une seule requête SQL optimisée plutôt que par des requêtes séquentielles, améliorant la latence de 2 à 3 fois. Cela fonctionne par défaut car RefactKit inclut les définitions complètes `relations()` de Drizzle ORM.
- **Identité d'Application Dynamique** : Le nom de l'application (`appName`) est configuré dynamiquement via la variable d'environnement `APP_NAME` (par ex. dans `.env`). Cela garantit que ton image de marque est automatiquement appliquée à tous les systèmes Better Auth, y compris les modèles d'emails et le plugin interne Better Auth Dashboard.

### 🔑 Flux OAuth Social & Sécurité

RefactKit implémente les flux sociaux OAuth (Google, Microsoft, GitHub, LinkedIn, Twitter) avec une sécurité maximale (PKCE + Chiffrement AES).

#### Diagramme de Séquence

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend (React)
    participant B as Backend (Better Auth)
    participant G as Google OAuth
    participant DB as Supabase (PostgreSQL)

    U->>F: Clique sur "Continuer avec Google"
    F->>B: POST /api/auth/sign-in/social (provider: 'google')
    B-->>B: Génère State & Code Verifier (PKCE)
    B-->>F: Set-Cookie (state) + Redirection vers Google
    F->>G: Redirection vers Écran de Consentement
    U->>G: Approuve l'accès
    G-->>F: Redirection vers /api/auth/callback/google?code=...
    F->>B: GET /api/auth/callback/google
    B->>G: Échange le Code contre les Tokens (Access/Refresh)
    B-->>B: Chiffre les Tokens avec BETTER_AUTH_SECRET (AES-256-GCM)
    B->>DB: Sauvegarde Utilisateur + Compte (Tokens Chiffrés)
    B-->>F: Set-Cookie (session) + Redirection vers /dashboard
    F->>U: Affiche le Tableau de bord
```

#### Sécurité des Tokens OAuth
Contrairement aux intégrations standards, RefactKit **chiffre systématiquement** les access tokens et refresh tokens avant de les stocker.

1.  **Chiffrement au Repos** : Tous les tokens sociaux sont chiffrés via AES-256-GCM en utilisant votre `BETTER_AUTH_SECRET`. Même en cas de fuite de base de données, vos utilisateurs restent protégés.
2.  **Isolation Client** : Le navigateur ne voit **jamais** les tokens sociaux. Le déchiffrement a lieu exclusivement côté serveur pendant les appels API authentifiés.
3.  **Protection PKCE** : Protection automatique contre l'interception du code d'autorisation, assurant que seul votre serveur peut finaliser l'échange de token.

| Fichier | Objectif |
|---|---|
| `lib/auth.ts` | Config Better Auth côté serveur avec tous les contrôles OWASP |
| `lib/auth-client.ts` | Client navigateur avec les plugins `organizationClient()` + `sentinelClient()` |
| `src/routes/_auth/signup.tsx` | Inscription anti-énumération (même UI pour anciens/nouveaux emails) |
| `src/routes/_auth/login.tsx` | Messages d'erreurs génériques uniquement |
| `src/routes/_auth/forgot-password.tsx` | Affiche toujours "vérifiez votre boîte mail" |

---

## 👥 Rôles & RBAC

RefactKit utilise `createAccessControl` de Better Auth avec un modèle granulaire de permission ressource→action.

### Matrice de Permissions

| Ressource → Action | Membre (Member) | Admin | Propriétaire (Owner) |
|---|:---:|:---:|:---:|
| `dashboard:read` | ✅ | ✅ | ✅ |
| `member:read` | — | ✅ | ✅ |
| `member:create` | — | ✅ | ✅ |
| `member:update` | — | ✅ | ✅ |
| `member:delete` | — | — | ✅ |
| `invitation:read` | — | ✅ | ✅ |
| `invitation:create` | — | ✅ | ✅ |
| `invitation:update` | — | — | ✅ |
| `invitation:delete` | — | ✅ | ✅ |
| `organization:update` | — | — | ✅ |
| `organization:delete` | — | — | ✅ |

### Hiérarchie des Rôles & Rôles Personnalisés (Dynamic Access Control)

Par défaut, une organisation possède trois rôles statiques :

```mermaid
graph TB
    Owner["🔑 Propriétaire<br/>Contrôle total sur l'org,<br/>membres, invitations,<br/>paramètres, suppression"]
    Admin["🛡️ Admin<br/>Gère les membres (non-proprios),<br/>envoie invitations,<br/>lit le dashboard"]
    Member["👤 Membre<br/>Voit le dashboard uniquement.<br/>Aucun accès de gestion."]

    Owner --> Admin --> Member
```

**Création de Rôles Personnalisés (Dynamic Access Control)** :
Bien que les trois rôles par défaut couvrent la majorité des cas d'usage, les utilisateurs du SaaS (Locataires) ont la liberté de créer des **rôles personnalisés** dynamiquement via l'onglet **"Rôles & Permissions"** dans les paramètres de leur organisation. 
Grâce à la fonctionnalité `dynamicAccessControl` de Better Auth, les Propriétaires et Admins peuvent créer de nouveaux rôles (ex: "Éditeur", "Responsable Facturation") et sélectionner précisément les permissions qu'ils souhaitent accorder pour chaque ressource via une matrice visuelle. Ces rôles personnalisés sont stockés en toute sécurité dans la base de données (table `organization_role`).

### RBAC de l'Organisation vs. Super Admin Global

Il est essentiel de comprendre les deux couches d'administration distinctes fournies dans RefactKit :

| Couche | Portée | Public Cible | Stockage | Objectif |
|---|---|---|---|---|
| **Contrôle d'Accès Dynamique (RBAC)** | **Organisation** | Locataires SaaS | `member.role` | Permet au propriétaire d'une organisation de gérer les permissions de sa propre équipe et de créer des rôles personnalisés au sein de son espace de travail isolé. |
| **Plugin Admin (Super Admin)** | **Global** | Propriétaire du SaaS (Vous) | `user.role` | Vous donne le pouvoir absolu sur l'ensemble de l'application. Vous pouvez accéder au tableau de bord Better Auth via `/api/auth/dashboard` pour gérer/bannir tous les utilisateurs et superviser le système. |

### Comment le RBAC est appliqué

1. **Côté Serveur** (`lib/auth.ts`) : `createAccessControl` définit les ressources et les actions. Les rôles sont assignés via `ac.newRole()`.
2. **Vérification d'appartenance** (`src/server/org-fns.ts`) : Chaque fonction serveur interroge la table `member` pour vérifier que l'utilisateur appartient à l'organisation et a le rôle requis.
3. **Gardes de route** (`_app/route.tsx`) : `beforeLoad` vérifie l'existence de la session avant le rendu de toute route protégée.
4. **Protection du Propriétaire** : Better Auth empêche de retirer le dernier propriétaire. La propriété doit d'abord être transférée.

### Ajouter une Nouvelle Ressource de Permission

```typescript
// 1. Ajouter au contrôle d'accès (lib/auth.ts)
const ac = createAccessControl({
  dashboard: ['read'],
  member: ['read', 'create', 'update', 'delete'],
  billing: ['read', 'manage'],  // ← NOUVEAU
})

// 2. Assigner aux rôles
const adminRole = ac.newRole({
  billing: ['read'],  // L'Admin peut voir la facturation
})
const ownerRole = ac.newRole({
  billing: ['read', 'manage'],  // Le Propriétaire peut la gérer
})

// 3. Vérifier dans les fonctions serveur
const { data } = await authClient.organization.hasPermission({
  permission: 'billing:manage',
})
```

---

## 💻 Architecture Frontend

### TanStack Router — Routage Basé sur les Fichiers

Les routes sont organisées par niveau d'accès en utilisant des préfixes de routes de layout :

| Préfixe | Accès | Layout | Objectif |
|---|---|---|---|
| `_auth/` | Public | `AuthShell` | Login, signup, flux mot de passe |
| `_app/` | Protégé | Coquille Dashboard (sidebar + navbar) | Espace de travail de l'Organisation |
| `$slug/` | Protégé + lié à l'org | Hérite de `_app` | Pages spécifiques à l'org (dashboard, membres, galerie) |

**La protection des routes** se fait dans `_app/route.tsx` via `beforeLoad` :

```typescript
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const session = await getSession({ headers: getRequest().headers })
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  component: AppLayout,
})
```

### TanStack Query — Stratégie de Récupération des Données

RefactKit utilise un **modèle de fabrique d'options de requête** (`src/server/query-keys.ts`) pour assurer des clés de cache cohérentes entre le SSR et le client :

```typescript
// Défini une fois
export const orgBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ['org', slug] as const,
    queryFn: () => getOrgBySlug({ data: { slug } }),
  })

// Utilisé dans le loader de la route (SSR)
loader: async ({ context, params }) => {
  await context.queryClient.ensureQueryData(orgBySlugQuery(params.slug))
}

// Utilisé dans le composant (client)
const { data } = useQuery(orgBySlugQuery(slug))
// → Pas de refetch ! La donnée est déjà en cache depuis le SSR.
```

**Configuration du cache** (`src/router.tsx`) :

| Paramètre | Valeur | Effet |
|---|---|---|
| `staleTime` | 30 secondes | Les requêtes ne refetcheront pas pendant 30s après être devenues périmées (stale) |
| `defaultPreloadStaleTime` | 30 secondes | Les données préchargées restent fraîches durant la navigation |
| `scrollRestoration` | `true` | Position de défilement restaurée au retour en arrière |
| `defaultPreload` | `'intent'` | Les routes préchargent sur l'intention de survol/focus |

### Créer une Nouvelle Page

**Étape 1** — Créer le fichier de route :
```typescript
// src/routes/_app/organizations/$slug/my-page.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_app/organizations/$slug/my-page')({
  component: MyPage,
  loader: async ({ context, params }) => {
    // Populer le cache pour le SSR — aucun refetch côté client nécessaire
    await context.queryClient.ensureQueryData(myDataQuery(params.slug))
  },
})

function MyPage() {
  const { slug } = Route.useParams()
  const { data } = useQuery(myDataQuery(slug))
  return <div>{/* Votre UI */}</div>
}
```

**Étape 2** — Créer la fonction serveur :
```typescript
// src/server/my-fns.ts
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db } from '../../db/index'
import { auth } from '../../lib/auth'

export const getMyData = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { slug } = z.object({ slug: z.string() }).parse(data)
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Non Autorisé')
  // ... votre logique de requête
})
```

**Étape 3** — Créer l'option de requête :
```typescript
// src/server/query-keys.ts
export const myDataQuery = (slug: string) =>
  queryOptions({
    queryKey: ['my-data', slug] as const,
    queryFn: () => getMyData({ data: { slug } }),
  })
```

**Étape 4** — Mettre à jour les Permissions RBAC (`lib/auth.ts`) :
Si votre nouvelle page introduit une nouvelle entité (ex: `my-data`), vous devez la déclarer dans la matrice de contrôle d'accès Better Auth pour appliquer la sécurité côté serveur.
```typescript
// lib/auth.ts
const ac = createAccessControl({
  // ... entités existantes
  myData: ['create', 'read', 'update', 'delete'],
})

const memberRole = ac.newRole({
  // ...
  myData: ['read'], // Accès en lecture seule pour les membres
})
// Mettre à jour adminRole et ownerRole en conséquence
```

### Bonnes Pratiques de Réactivité

| Motif | Règle |
|---|---|
| **Clés Stables** | Ne jamais utiliser les index de tableau. Utilisez toujours `key={item.id}`. |
| **Reset Chgt Org** | Utilisez `key={org.id}` sur le conteneur de page pour réinitialiser l'état au changement d'org. |
| **État Dérivé** | Pour les images : `const currentImg = uploadedImg || defaultValue` pour éviter le clignotement. |
| **Invalidation Cache** | Après des mutations : `queryClient.invalidateQueries()` + `router.invalidate()`. |

---

## ⚙️ Architecture Backend

### Fonctions Serveur (createServerFn)

Toute la logique backend passe par les **Fonctions Serveur TanStack Start** — des fonctions typées qui s'exécutent exclusivement sur Nitro v3. Elles ne sont jamais envoyées dans le bundle client.

```mermaid
graph LR
    Client["Composant Client"] -->|"appelle fn({ data })"| SF["Fonction Serveur<br/>(s'exécute sur Nitro)"]
    SF -->|"Validation Zod"| Val["z.object().parse()"]
    Val --> Auth["getSession(headers)"]
    Auth -->|"Vérification membre"| DB["Drizzle → PostgreSQL"]
    DB -->|"Résultat typé"| SF
    SF -->|"Réponse JSON"| Client
```

**Fichiers de fonctions serveur** (`src/server/`) :

| Fichier | Responsabilité |
|---|---|
| `auth-fns.ts` | Aides à la récupération de session |
| `org-fns.ts` | Créer, lire, modifier, supprimer orgs + validation des membres |
| `dashboard-fns.ts` | Statistiques d'organisation (nombre de membres, etc.) |
| `gallery-fns.ts` | CRUD d'image de galerie (restreint à l'org) |
| `storage-fns.ts` | Upload de fichier Supabase (serveur seul, clé service role) |
| `query-keys.ts` | Fabriques d'options TanStack Query pour des clés cohérentes |

### Motif de Fonction Serveur

Chaque fonction serveur suit le même schéma de sécurité :

```typescript
export const myFunction = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  // 1. Valider l'entrée avec Zod
  const { name, orgId } = z.object({ name: z.string(), orgId: z.string() }).parse(data)

  // 2. Authentifier — obtenir la session depuis les cookies
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Non Autorisé')

  // 3. Autoriser — vérifier l'appartenance à l'org + le rôle
  const membership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, orgId), eq(member.userId, session.user.id)),
  })
  if (!membership || membership.role !== 'owner') throw new Error('Interdit')

  // 4. Exécuter la logique métier
  return await db.insert(myTable).values({ name, organizationId: orgId }).returning()
})
```

### Stockage — Flux d'Upload Sécurisé

Les uploads sont faits **uniquement côté serveur** pour protéger la clé `SUPABASE_SERVICE_ROLE_KEY` :

```mermaid
sequenceDiagram
    participant C as Client (ImageUpload)
    participant SF as Fonction Serveur (storage-fns.ts)
    participant S3 as Supabase Storage

    C->>C: Utilisateur sélectionne un fichier
    C->>SF: FormData { file, bucket: "avatars" }
    SF->>SF: Validation : taille ≤ 2Mo, type check
    SF->>SF: Génère un nom de fichier aléatoire
    SF->>S3: upload(fileName, arrayBuffer, { contentType })
    S3-->>SF: Succès
    SF->>S3: getPublicUrl(fileName)
    S3-->>SF: https://...supabase.co/storage/v1/object/public/...
    SF-->>C: { url: publicUrl }
    C->>C: setState(url) → aperçu immédiat via état dérivé
```

### Routes API

Better Auth gère sa propre API sur `src/routes/api/auth/` :

| Endpoint | Gestionnaire |
|---|---|
| `/api/auth/*` | Catch-all Better Auth (connexion, inscription, session, OAuth, opérations d'org) |
| `/api/test` | Endpoint de vérification d'état (health check) |

### Comment Ajouter un Nouvel Endpoint API

```typescript
// src/routes/api/my-endpoint.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/my-endpoint')({
  GET: async ({ request }) => {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
})
```

---

## 🗄️ Base de Données & Schéma

### Diagramme Entité Association (ER)

```mermaid
erDiagram
    USER {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        text image_url
        timestamp created_at
        timestamp updated_at
    }

    SESSION {
        text id PK
        timestamp expires_at
        text token UK
        text ip_address
        text user_agent
        text user_id FK
        text active_organization_id
        text provider
    }

    ACCOUNT {
        text id PK
        text account_id
        text provider_id
        text user_id FK
        text access_token
        text refresh_token
        text id_token
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope
        text password
    }

    VERIFICATION {
        text id PK
        text identifier
        text value
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    ORGANIZATION {
        text id PK
        text name
        text slug UK
        text logo
        text logo_url
        text metadata
        timestamp created_at
    }

    MEMBER {
        text id PK
        text organization_id FK
        text user_id FK
        text role
        timestamp created_at
    }

    INVITATION {
        text id PK
        text organization_id FK
        text email
        text role
        text status
        timestamp expires_at
        timestamp created_at
        text inviter_id FK
    }

    GALLERY_IMAGE {
        text id PK
        text name
        text url
        text size
        text organization_id FK
        timestamp created_at
    }

    USER ||--o{ SESSION : "a"
    USER ||--o{ ACCOUNT : "a"
    USER ||--o{ MEMBER : "appartient à"
    USER ||--o{ INVITATION : "invite"
    ORGANIZATION ||--o{ MEMBER : "a"
    ORGANIZATION ||--o{ INVITATION : "a"
    ORGANIZATION ||--o{ GALLERY_IMAGE : "possède"
```

### Modèle Multi-Locataire

Chaque table liée à un locataire (tenant) inclut une clé étrangère `organizationId` avec suppression en cascade :

```typescript
export const myTable = pgTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("my_table_organizationId_idx").on(table.organizationId),
])
```

> [!TIP]
> Ajoutez toujours un index sur `organizationId` — il est interrogé à chaque requête ciblant le locataire.

### Connexion Base de Données

`db/index.ts` utilise `postgres.js` avec les paramètres du transaction pooler Supabase :

```typescript
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false,    // CRITIQUE pour le Pooler Supabase (port 6543)
  max: 10,           // Taille du pool de connexion
  idle_timeout: 20,  // Secondes avant fermeture de la connexion inactive
  connect_timeout: 10,
})
export const db = drizzle(client, { schema })
```

### Commandes de Base de Données

| Commande | Objectif |
|---|---|
| `npx drizzle-kit push` | Synchronise les modifs de schema.ts directement sur PostgreSQL |
| `npx drizzle-kit studio` | Navigateur DB visuel à l'adresse https://local.drizzle.studio |
| `npx drizzle-kit generate` | Génère les fichiers de migration SQL (pour le contrôle de version) |

---

## 🌐 Internationalisation

RefactKit utilise un **contexte React personnalisé** enveloppant i18next pour une internationalisation entièrement compatible SSR.

### Locales Supportées

| Locale | Langue | Direction | Police par Défaut |
|---|---|---|---|
| `en` | Anglais | LTR | Google Sans Flex |
| `fr` | Français | LTR | Google Sans Flex |
| `es` | Espagnol | LTR | Google Sans Flex |
| `pt` | Portugais | LTR | Google Sans Flex |
| `de` | Allemand | LTR | Google Sans Flex |
| `zh` | Chinois | LTR | Google Sans Flex |
| `be` | Biélorusse | LTR | Google Sans Flex |
| `hi` | Hindi | LTR | Baloo Bhaijaan 2 |
| `it` | Italien | LTR | Google Sans Flex |
| `ru` | Russe | LTR | Google Sans Flex |
| `ar` | Arabe | RTL | Zain |
| `ar-ma`| Arabe Marocain| RTL | Zain |

### Comment ça marche

1. **Serveur** : `getServerLocale()` lit le cookie `locale` depuis les en-têtes de la requête durant le SSR.
2. **Layout Racine** : Passe la locale au `<I18nProvider initialLocale={locale}>` et définit `<html lang dir>`.
3. **Composants** : Utilisez `const { t, locale, dir } = useI18n()` pour accéder aux traductions.
4. **Basculement** : `setLocale('ar')` met à jour l'état + conserve le cookie + retourne `document.dir`.

### Ajouter une Nouvelle Locale

1. Créez `src/i18n/locales/de.ts` avec toutes les clés de traduction.
2. Enregistrez-la dans `src/i18n/index.ts` :
   ```typescript
   import de from './locales/de'
   const translations = { en, fr, es, pt, ar, de }
   export type Locale = 'en' | 'fr' | 'es' | 'pt' | 'ar' | 'de'
   ```
3. Ajoutez la police (si nécessaire) dans `src/styles/globals.css`.

---

## 📝 Formulaires & Système de Design

### Formulaires TanStack + Validation Zod

Les formulaires utilisent **TanStack Form** avec des validateurs de schéma Zod et des primitives **Base UI** :

```tsx
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  email: z.string().email('Email invalide'),
})

const form = useForm({
  defaultValues: { name: '', email: '' },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await myServerFunction({ data: value })
  },
})
```

### Règles du Système de Design

| Règle | À Faire | À Ne Pas Faire |
|---|---|---|
| **Couleurs** | `bg-primary`, `text-muted-foreground` | `bg-blue-500`, `dark:bg-slate-900` |
| **Espacement**| `flex flex-col gap-4` | `space-y-4` |
| **Dimensions**| `size-10` (l/h égaux) | `w-10 h-10` |
| **Icônes** | `data-icon="inline-start"` | SVG Brut en ligne |
| **Thèmes** | Variables CSS via `@theme` | Valeurs de couleur en dur |

### 🎨 Ajouter des Thèmes de Couleur Sélectionnables

RefactKit prend en charge plusieurs thèmes de couleurs à l'exécution via des attributs de données CSS (`[data-theme="..."]`), permettant aux utilisateurs de changer de couleur instantanément sans recompiler l'application.

Pour ajouter un nouveau preset de couleur (ex: "Neon") :

1. **Ajouter les Variables CSS** : Ajoutez votre palette dans `src/styles/globals.css`. Assurez-vous de cibler votre nouvel attribut `data-theme` pour les modes clair et `.dark`.
   ```css
   /* Preset: Neon */
   [data-theme="neon"] {
     --primary: oklch(0.6 0.2 320);
     --primary-foreground: oklch(0.985 0 0);
     /* ... autres variables ... */
   }
   .dark[data-theme="neon"] {
     --primary: oklch(0.7 0.18 320);
     /* ... autres variables ... */
   }
   ```

2. **Mettre à jour les Définitions TypeScript** : Ajoutez l'identifiant du nouveau thème au type d'union `ColorTheme` dans `src/hooks/use-color-theme.ts`.
   ```ts
   export type ColorTheme = 'default' | 'vega' | 'maia' | 'lyra' | 'mira' | 'luma' | 'neon'
   ```

3. **Ajouter au Sélecteur UI** : Ajoutez la configuration de votre preset au tableau `COLOR_PRESETS` dans `src/components/shared/auth-ui.tsx` et `src/components/settings/account/appearance.tsx`.
   ```tsx
   { value: 'neon', label: 'Neon', color: 'bg-pink-500' }
   ```

### Appliquer un Thème de Base Shadcn

Générez un preset sur [ui.shadcn.com](https://ui.shadcn.com) et appliquez-le :
```bash
npx shadcn@latest apply --preset <votre-code-preset>
```

---

## 🧪 DevOps, Observabilité & Tests

### Déploiement

#### Vercel (Principal — Recommandé)

Préconfiguré dans `package.json` :
```bash
"build": "NITRO_PRESET=vercel vite build"
```

**Variables d'environnement requises** (Vercel Dashboard → Settings → Environment Variables) :

| Variable | Valeur | Requise |
|---|---|---|
| `DATABASE_URL` | Chaîne de connexion Supabase (port 6543 pour le pooler) | ✅ |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `BETTER_AUTH_URL` | `https://votre-domaine.com` | ✅ |
| `RESEND_API_KEY` | `re_...` depuis le tableau de bord Resend | ✅ |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Depuis le tableau de bord Supabase | ✅ |
| `VITE_APP_URL` | `https://votre-domaine.com` | Optionnel |
| `OPENAPI_NONCE` | `refactkit-openapi-nonce` | Optionnel |

#### Autres Cibles (Cloudflare, Node.js)

Modifiez le preset Nitro :
```bash
# Cloudflare Workers
NITRO_PRESET=cloudflare-module vite build

# Node.js Autonome
NITRO_PRESET=node vite build
node .output/server/index.mjs
```

### Observabilité

| Outil | Ce Qu'il Affiche | Comment Y Accéder |
|---|---|---|
| **Drizzle Studio** | Navigateur visuel DB — voir/éditer toutes les tables | `npx drizzle-kit studio` |
| **Supabase Dashboard** | Logs DB, navigateur de stockage, politiques RLS | `https://app.supabase.com` |
| **Logs Serveur Audit** | Logs avec préfixe `[AUDIT]` pour les événements liés aux sessions/emails | Terminal / Logs de Fonction Vercel |
| **Better Auth Dash** | Panneau d'admin intégré (plugin `dash()`) | `/api/auth/admin` |
| **TanStack DevTools**| Inspecteur de cache de requêtes, état du routeur | Chargé auto en mode dev |

### Qualité du Code

| Outil | Commande | Objectif |
|---|---|---|
| **Biome Lint** | `pnpm lint` | Intercepte les pépins (Vitesse Rust) |
| **Biome Format**| `pnpm format` | Auto-formate tous les fichiers |
| **Biome Check** | `pnpm check` | Linter + formatage en un seul passage |
| **TypeScript** | Mode strict activé dans `tsconfig.json` | Sécurité des types à la compilation |

### Tests

#### Tests Unitaires & d'Intégration (Vitest)

```bash
pnpm test              # Lance tous les tests (inclut Biome check)
pnpm test:watch        # Mode watch pour le développement
pnpm test:coverage     # Génère rapport de couverture v8 → coverage/
npx vitest --ui        # Exécuteur de tests visuel dans le navigateur
```

- **Framework** : Vitest 4.x + React Testing Library + JSDOM
- **Emplacement** : `src/**/*.{test,spec}.{ts,tsx}`
- **Setup** : `src/test/setup.ts`

#### Tests End-to-End (Playwright)

```bash
pnpm test:e2e                  # Lance tous les tests E2E
npx playwright test --ui       # Mode interactif avec visualiseur de trace
npx playwright test --headed   # Voir le navigateur durant le test
```

- **Framework** : Playwright 1.59+ (Chromium, Firefox, WebKit)
- **Emplacement** : Dossier `e2e/`
- **Auto-serveur** : Playwright démarre `pnpm dev` automatiquement avant les tests
- **Configuration** : `playwright.config.ts` — Rapport HTML, trace sur le premier essai

### Check-list de Pré-Déploiement

```bash
pnpm check           # Lint Biome + formatage
pnpm test            # Les tests unitaires passent
pnpm test:e2e        # Les tests E2E passent
npx drizzle-kit push # Le schéma est synchronisé
```

---

## 🤖 Développement Assisté par l'IA

RefactKit inclut des **Skills** (Compétences) spécialisés dans `.agents/skills/` qui apprennent aux assistants de codage IA les modèles exacts, les API et les conventions de cette stack technique.

### Compétences Disponibles

| Compétence | Quand l'utiliser |
|---|---|
| `better-auth-best-practices` | Config Auth, sessions, plugins, adaptateurs base de données |
| `better-auth-security-best-practices` | Rate limit, CSRF, cookies, traçage d'IP, journaux d'audit |
| `email-and-password-best-practices` | Vérification d'email, réinitialisation de mot de passe, hachage |
| `organization-best-practices` | Organisations, membres, invitations, RBAC, équipes |
| `create-auth-skill` | Générer l'authentification depuis zéro |
| `shadcn` | Composants UI, thèmes, presets |

### Comment Utiliser avec Votre IA

Lors de vos prompts avec votre assistant IA, **mentionnez via @** la compétence correspondante :

```
"Ajoute une page de facturation avec l'intégration Stripe.
 Lis @.agents/skills/shadcn/SKILL.md pour les modèles UI
 et @AGENTS.md pour l'architecture globale."
```

### Ajouter de Nouvelles Compétences

```bash
pnpm dlx skills add shadcn/ui    # Composants UI & Base UI
pnpm dlx skills add tanstack     # Routeur, Query, Start, Form
pnpm dlx skills add drizzle      # Base de données & ORM
pnpm dlx skills add supabase     # Stockage & Infrastructure
pnpm dlx skills add better-auth  # Authentification & Organisations
```

> [!TIP]
> Plus vous référencez explicitement les fichiers de compétences dans vos prompts, moins vous aurez d'hallucinations — le code généré correspondra aux règles strictes de typage et de composition du projet.

---

## 💳 Paiements & Facturation (Pro)

> [!NOTE]
> Les fonctionnalités de paiement et de facturation **ne sont pas incluses dans la Community Edition**. Elles sont réservées à **RefactKit Pro**, actuellement en développement.

RefactKit Pro sera livré avec un système de facturation complet et prêt pour la production, articulé autour de deux fournisseurs :

### Stripe — Abonnements & Paiements Uniques

| Fonctionnalité | Détails |
|---|---|
| Paiement (Checkout)| Stripe Checkout (hébergé) + Elements (UI personnalisée) |
| Modèles de prix | Tarif fixe, par siège (synchronisé avec `membershipLimit` de l'org), facturation à l'usage, paiements uniques |
| Cycle de vie abo | `trial → active → past_due → cancelled → expired` avec synchro auto de l'état via webhooks |
| Gestionnaire de webhook| `/api/billing/webhook` — vérification de signature, routage d'événement, synchro DB |
| Portail client | Facturation en libre-service : gérer les plans, les moyens de paiement, télécharger les factures |
| Mode Test/Live | Un seul changement de variable `STRIPE_SECRET_KEY` — aucun code à modifier |

### Polar — Monétisation Adaptée à l'Open Source

| Fonctionnalité | Détails |
|---|---|
| Abonnements | Plans tarifaires fixes et basés sur l'usage |
| Achats uniques | Licences à vie, modules complémentaires (add-ons) |
| Intégration Open Source| Conçu pour les outils de développement et les produits open-core |
| Avantages | Accorder l'accès au repo GitHub, des rôles Discord, ou le téléchargement de fichiers à l'achat |

### Ce que débloque la version Pro

```
Community (ce repo)            Pro (bientôt disponible)
──────────────────────         ──────────────────
✅ Auth & Organisations         ✅ Tout le contenu de la Community Edition
✅ RBAC                         ✅ Abonnements & Webhooks Stripe
✅ Multi-locataire              ✅ Intégration Polar
✅ i18n (10 langues)            ✅ Tableau de bord Administrateur
✅ Uploads de Stockage          ✅ Impersonation (Super-admin)
✅ Module Galerie               ✅ Facturation par siège
                                ✅ Portail Client
                                ✅ Support Prioritaire
```

> [!TIP]
> Envie d'être averti(e) au lancement de RefactKit Pro ? Mettez une étoile (Star) sur le repo et surveillez les prochaines versions (releases).

---

## 📄 Licence

RefactKit est publié sous **Licence MIT** — libre d'utilisation, de modification et de distribution, pour n'importe quel but, y compris des projets commerciaux.

Voir [LICENSE](LICENSE) pour le texte complet.

---

### 🤝 Contribuer

Ce projet est piloté par la communauté et chaque contribution compte — qu'il s'agisse de corriger un bug, d'ajouter une nouvelle fonctionnalité, d'une traduction, ou simplement d'en parler autour de vous.

- **Vous avez trouvé un bug ?** [Ouvrez un ticket (issue)](https://github.com/your-org/refactkit-multitenancy/issues)
- **Vous avez une idée ?** [Démarrez une discussion](https://github.com/your-org/refactkit-multitenancy/discussions)
- **Vous souhaitez contribuer au code ?** Forkez le repo, créez une branche, et ouvrez une Pull Request (PR). Assurez-vous que `pnpm format` et `pnpm lint` passent avant de soumettre.
- **Vous avez créé quelque chose avec RefactKit ?** Partagez-le dans la section [Discussions → Show & Tell](https://github.com/your-org/refactkit-multitenancy/discussions) — nous adorerions voir ce que vous développez. 🚀

> [!TIP]
> Si RefactKit vous fait gagner du temps, la meilleure façon de remercier est de ⭐ **mettre une étoile (star) au repo** — cela aide les autres développeurs à découvrir le projet et fait grandir la communauté.

---

<div align="center">

Créé avec soin par **[@devh2t](https://github.com/devh2t)** — un Créateur de Logiciels qui croit qu'un bon outillage doit être accessible à tous.

*Fait avec ❤️ pour les développeurs indépendants, makers, et fondateurs expédiant leur prochain gros succès.*

</div>
