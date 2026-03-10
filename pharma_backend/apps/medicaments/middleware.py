# apps/medicaments/middleware.py
class ForceCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        print("🚀 Middleware ForceCorsMiddleware INITIALISÉ")

    def __call__(self, request):
        print(f"📡 Requête reçue: {request.method} {request.path}")
        response = self.get_response(request)
        print("✅ Réponse générée, ajout des headers CORS")
        
        # Ajouter les headers CORS
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response