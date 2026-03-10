# config/settings.py
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-zh^+(wbkzh5nprtc!1f=6+bun$!mxaw5-z(n&$6#&)%825)ujn'
DEBUG = True
ALLOWED_HOSTS = ['*']  # Temporaire pour le développement

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Bibliothèques tierces
    'corsheaders',  # Doit être en premier
    'rest_framework',
    'django_filters',
    
    # Vos apps
    'apps.medicaments',
    'apps.categories',
    'apps.ventes',
]

MIDDLEWARE = [
    'apps.medicaments.middleware.ForceCorsMiddleware',  # EN TOUT PREMIER
    'corsheaders.middleware.CorsMiddleware',  # Gardez celui-ci aussi
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# Configuration CORS - CORRECTE
CORS_ALLOW_ALL_ORIGINS = True  # Pour le développement seulement
CORS_ALLOW_CREDENTIALS = True

# Ou configuration spécifique (décommentez si vous préférez)
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://localhost:8000",
# ]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Le reste de votre configuration...
ROOT_URLCONF = 'config.urls'

# ... (le reste du fichier reste inchangé)