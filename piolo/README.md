# 🏠 Piolo — Plateforme Immobilière Numérique du Cameroun

> Trouvez, visitez et louez votre bien immobilier en toute sécurité à Yaoundé, Douala et partout au Cameroun.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/Licence-Propriétaire-red?style=flat-square)

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture Technique](#-architecture-technique)
- [Prérequis](#-prérequis)
- [Installation Locale](#-installation-locale)
- [Configuration Base de Données](#-configuration-de-la-base-de-données)
- [Identifiants par Défaut](#-identifiants-par-défaut)
- [Structure du Projet](#-structure-du-projet)
- [Branches Git & Workflow](#-branches-git--workflow)
- [Déploiement](#-déploiement-production)
- [Licence](#-licence)
- [Support](#-support)

---

## 👁️ Aperçu

**Piolo** est une plateforme immobilière numérique développée avec **Django 4.2** (backend) et **React 18 + Vite** (frontend), conçue spécifiquement pour le marché immobilier camerounais.

| Ce que Piolo résout | Solution apportée |
|---------------------|------------------|
| Bailleurs non vérifiés | Vérification manuelle d'identité (CNI + selfie) |
| Loyers opaques | Estimation automatique par IA |
| Visites chronophages | Visites virtuelles 3D |
| Intermédiaires coûteux | Contact direct locataire ↔ bailleur |
| Manque de pros qualifiés | Annuaire d'architectes certifiés |

---

## ⚙️ Fonctionnalités

### 🏠 Pour les Locataires
- Recherche avancée (type, quartier, prix, surface, équipements)
- Carte interactive géolocalisée
- Visites virtuelles 360° (coût : 5 points)
- Contact direct du bailleur (coût : 3 points)
- Favoris et alertes nouvelles annonces

### 🏢 Pour les Bailleurs
- Dossier de vérification d'identité (validation admin obligatoire)
- Publication d'annonces avec photos et visite 3D
- Tableau de bord : vues, contacts, performance
- Boost d'annonces premium (15 points/semaine)
- Estimation IA du loyer de marché

### 🧱 Pour les Architectes & Entrepreneurs
- Profil professionnel certifié par l'admin
- Portfolio de réalisations illustré
- Système d'avis et de notation clients
- Abonnements pro (mensuel / annuel)

### 💰 Système de Points PIolo
| Action | Points |
|--------|--------|
| Inscription | +50 pts |
| Parrainage | +20 pts |
| Visite 3D | -5 pts |
| Afficher contact bailleur | -3 pts |
| Rapport de marché IA | -10 pts |
| Boost annonce (7j) | -15 pts |

Recharge via **MTN Mobile Money** ou **Orange Money**.

---

## 🏗️ Architecture Technique

```
piolo/                        ← Dépôt principal (ce repo)
├── piolo/                    ← Backend Django
└── piolo-frontend/           ← Frontend React + Vite
```

```
┌──────────────────────┐     API REST      ┌──────────────────────┐
│   Frontend           │ ◄───────────────► │   Backend            │
│   React 18 + Vite    │   JSON / Axios    │   Django 4.2 + DRF   │
│   localhost:5173     │                   │   localhost:8000     │
└──────────────────────┘                   └──────────┬───────────┘
                                                      │ ORM
                                           ┌──────────▼───────────┐
                                           │   MySQL 8.0          │
                                           │   piolo_db           │
                                           └──────────────────────┘
```

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | Python + Django + DRF | 3.12 / 4.2 |
| Frontend | React + Vite | 18 / 5.x |
| Base de données | MySQL | 8.0 |
| Serveur WSGI | Gunicorn | 21.x |
| Proxy | Nginx | 1.24 |
| Cache *(optionnel)* | Redis | 7.x |

---

## 📦 Prérequis

### Environnement recommandé : **WSL2 Ubuntu 22.04** (Windows) ou **Ubuntu 22.04** natif

| Dépendance | Version min. | Commande d'installation Ubuntu/WSL |
|------------|-------------|-------------------------------------|
| Python | 3.10+ | `sudo apt install python3.12 python3.12-venv python3-pip` |
| Node.js | 18.x | voir ci-dessous |
| npm | 9.x | inclus avec Node.js |
| MySQL | 8.0 | `sudo apt install mysql-server` |
| Git | 2.30+ | `sudo apt install git` |

**Installer Node.js 18 sur Ubuntu/WSL :**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Vérifier les versions installées :**
```bash
python3 --version    # Python 3.12.x
node --version       # v18.x.x
npm --version        # 9.x.x
mysql --version      # mysql  Ver 8.0.x
git --version        # git version 2.x.x
```

---

## 🚀 Installation Locale

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/VOTRE_USERNAME/piolo.git
cd piolo
git checkout dev          # toujours travailler sur dev
```

---

### Étape 2 — Backend Django

```bash
# 2.1 — Créer et activer l'environnement virtuel Python
python3 -m venv env
source env/bin/activate

# Vérifier que l'environnement est bien actif (le prompt affiche "(env)")
which python    # doit pointer vers .../piolo/env/bin/python

# 2.2 — Mettre à jour pip et installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Étape 3 — Frontend React

```bash
# Se placer dans le dossier frontend
cd piolo-frontend

# Installer les dépendances Node
npm install

# Revenir à la racine
cd ..
```

---

### Étape 4 — Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Générer une clé secrète Django :
```bash
source env/bin/activate
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Coller le résultat dans `.env` à la ligne `SECRET_KEY=`.

Éditer `.env` avec vos valeurs de base de données :
```ini
DEBUG=True
SECRET_KEY=la-cle-generee-ci-dessus

DB_ENGINE=django.db.backends.mysql
DB_NAME=piolo_db
DB_USER=piolo_user
DB_PASSWORD=votre-mot-de-passe
DB_HOST=localhost
DB_PORT=3306
```

---

### Étape 5 — Configurer MySQL

Se connecter à MySQL en root :
```bash
sudo mysql -u root -p
```

Dans la console MySQL, exécuter :
```sql
-- Créer la base de données
CREATE DATABASE piolo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur
CREATE USER 'piolo_user'@'localhost' IDENTIFIED BY 'votre-mot-de-passe';

-- Accorder les privilèges
GRANT ALL PRIVILEGES ON piolo_db.* TO 'piolo_user'@'localhost';
FLUSH PRIVILEGES;

-- Vérifier
SHOW DATABASES;
EXIT;
```

---

### Étape 6 — Migrations et superutilisateur

```bash
source env/bin/activate

# Appliquer les migrations
python manage.py migrate

# Créer le compte administrateur
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic --noinput
```

---

### Étape 7 — Lancer les serveurs

Ouvrir **deux terminaux** :

**Terminal 1 — Backend Django :**
```bash
cd /var/www/html/piolo    # ou le chemin vers votre projet
source env/bin/activate
python manage.py runserver
```

**Terminal 2 — Frontend React :**
```bash
cd /var/www/html/piolo/piolo-frontend
npm run dev
```

✅ L'application est disponible sur :

| Service | URL |
|---------|-----|
| Interface web (Django) | http://localhost:8000 |
| Interface React (Vite) | http://localhost:5173 |
| Admin Django | http://localhost:8000/admin/ |
| API REST | http://localhost:8000/api/ |

---

## 🗄️ Configuration de la Base de Données

### Variables `.env` à configurer

```ini
DB_ENGINE=django.db.backends.mysql
DB_NAME=piolo_db
DB_USER=piolo_user
DB_PASSWORD=votre-mot-de-passe-securise
DB_HOST=localhost
DB_PORT=3306
```

### Connecteur MySQL pour Python

Si vous obtenez une erreur `mysqlclient` ou `mysql connector` :
```bash
# Sur Ubuntu/WSL
sudo apt install python3-dev default-libmysqlclient-dev build-essential pkg-config
pip install mysqlclient
```

---

## 🔑 Identifiants par Défaut

Après `python manage.py createsuperuser` et les futurs seeders :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | `admin@piolo.cm` | *(défini lors du createsuperuser)* |
| Bailleur Test | `bailleur@test.cm` | `Test@1234` |
| Locataire Test | `locataire@test.cm` | `Test@1234` |
| Architecte Test | `archi@test.cm` | `Test@1234` |

> ⚠️ **Sécurité** : Modifiez immédiatement les mots de passe par défaut, surtout en production !

---

## 📁 Structure du Projet

```
piolo/                              ← Racine du projet (ce dépôt)
│
├── apps/                           ← Applications Django métier
│   ├── core/                       ← Pages statiques (Accueil, À propos, Contact)
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── templates/core/
│   ├── accounts/                   ← Auth, profils, vérification bailleurs
│   ├── properties/                 ← Annonces immobilières, recherche, carte
│   ├── professionals/              ← Module architectes & entrepreneurs
│   ├── messaging/                  ← Messagerie interne temps réel
│   ├── points/                     ← Système de points et recharges
│   └── ai/                         ← Module IA estimation des loyers
│
├── piolo/                          ← Configuration principale Django
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── piolo-frontend/                 ← Application React + Vite
│   ├── src/
│   │   ├── components/             ← Composants réutilisables
│   │   ├── pages/                  ← Pages complètes
│   │   ├── services/               ← Appels API (axios)
│   │   ├── hooks/                  ← Custom React hooks
│   │   └── main.jsx                ← Point d'entrée React
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── static/                         ← Fichiers statiques Django (CSS, JS, images)
├── media/                          ← Uploads utilisateurs (ignoré par Git)
├── templates/                      ← Templates HTML Django
├── logs/                           ← Logs applicatifs (ignoré par Git)
│
├── env/                            ← Environnement virtuel Python (ignoré par Git)
├── .env                            ← Variables d'environnement (ignoré par Git)
├── .env.example                    ← Modèle .env à copier ✅
├── .gitignore                      ← Fichiers ignorés par Git
├── requirements.txt                ← Dépendances Python
├── manage.py                       ← Script de gestion Django
├── gunicorn.conf.py                ← Configuration Gunicorn (production)
└── README.md                       ← Ce fichier
```

---

## 🔄 Branches Git & Workflow

### Stratégie de branches

| Branche | Rôle | Accès |
|---------|------|-------|
| `master` | 🚀 Production stable — déployé sur le serveur | Protégée — PR obligatoire |
| `test` | 🧪 Pré-production / Recette client | Protégée — Tests requis |
| `dev` | 🛠️ Développement actif de l'équipe | Libre — merge des features |

### Cycle de vie d'une fonctionnalité

```
master ◄──── (PR validée) ──── test ◄──── (PR validée) ──── dev
                                                              ▲
                                                feature/ma-fonctionnalite
```

### Commandes quotidiennes

```bash
# 1. Toujours partir de dev à jour
git checkout dev
git pull origin dev

# 2. Créer une branche pour votre tâche
git checkout -b feature/nom-de-la-fonctionnalite
# Exemples :
# git checkout -b feature/recherche-avancee
# git checkout -b feature/module-architectes
# git checkout -b fix/correction-login

# 3. Développer, puis committer régulièrement
git add .
git commit -m "feat: description claire de ce qui a été fait"

# Conventions de commit :
# feat:     nouvelle fonctionnalité
# fix:      correction de bug
# chore:    tâche technique (config, dépendances)
# docs:     documentation
# style:    formatage, CSS
# refactor: restructuration du code
# test:     ajout/modification de tests

# 4. Pousser et créer une Pull Request vers dev
git push origin feature/nom-de-la-fonctionnalite
# → Créer la PR sur GitHub vers la branche dev
# → Attendre une review avant de merger
```

---

## 🚢 Déploiement Production

### Serveur requis
- Ubuntu 22.04 LTS
- Python 3.12, Nginx, Gunicorn
- MySQL 8.0
- Certificat SSL (Let's Encrypt)

### Commandes de déploiement

```bash
# Cloner la branche master (production)
git clone -b master https://github.com/VOTRE_USERNAME/piolo.git /var/www/piolo
cd /var/www/piolo

# Environnement
cp .env.example .env
# → Éditer .env : DEBUG=False, SECRET_KEY réelle, DB de production

# Dépendances
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt

# Frontend
cd piolo-frontend && npm install && npm run build && cd ..

# Django
python manage.py migrate
python manage.py collectstatic --noinput

# Redémarrer
sudo systemctl restart nginx gunicorn
```

---

## 📜 Licence

© 2026 **Piolo** — KOM Nick. Tous droits réservés.

Ce projet est un logiciel propriétaire. Toute reproduction, distribution ou modification sans autorisation explicite est interdite.

---

## 🆘 Support

| Type | Contact |
|------|---------|
| 🐛 Bug / Issue | [Ouvrir un ticket GitHub](https://github.com/VOTRE_USERNAME/piolo/issues) |
| 💬 Équipe dev | Canal `#piolo-dev` (Discord/WhatsApp) |
| 📧 Email | `dev@piolo.cm` |

---

> 💡 **Rappel pour les contributeurs** :
> Avant tout commit sur `dev` :
> - ✅ Tester en local que la page s'affiche sans erreur
> - ✅ `source env/bin/activate && python manage.py check` (zéro erreur)
> - ✅ Respecter les conventions de commit ci-dessus
> - ✅ Ne jamais committer le fichier `.env` ni le dossier `env/`