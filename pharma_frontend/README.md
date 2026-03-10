# Application de Gestion de Pharmacie

Application complète de gestion de pharmacie avec Django (backend) et React (frontend).

## 📋 Fonctionnalités

- **Gestion des médicaments** : CRUD complet avec filtres et recherche
- **Gestion des catégories** : Classification des médicaments
- **Gestion des ventes** : Création de ventes avec déduction automatique du stock
- **Alertes automatiques** : Stock bas, expiration proche
- **Tableau de bord** : Statistiques et vue d'ensemble

## 🚀 Technologies utilisées

### Backend
- Python 3.14 / Django 6.0
- Django REST Framework
- SQLite (développement) / PostgreSQL (production)
- Django CORS Headers
- Django Filters

### Frontend
- React 18
- Ant Design
- Axios
- React Router DOM
- Day.js

## 📦 Installation

### Prérequis
- Python 3.14+
- Node.js 18+
- npm ou yarn

### Backend

```bash
# Cloner le repository
git clone <votre-repo>
cd pharma-app/backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos configurations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver