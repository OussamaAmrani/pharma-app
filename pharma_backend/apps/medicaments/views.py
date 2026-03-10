# apps/medicaments/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Medicament
from .serializers import MedicamentSerializer

class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.filter(est_actif=True)
    serializer_class = MedicamentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres
    filterset_fields = {
        'categorie': ['exact'],
        'ordonnance_requise': ['exact'],
        'est_actif': ['exact'],
        'stock_actuel': ['lt', 'gt'],  # Permet de filtrer par stock < seuil
        'date_expiration': ['lt', 'gt'],
    }
    
    # Recherche
    search_fields = ['nom', 'dci', 'forme', 'dosage', 'categorie__nom']
    
    # Tri
    ordering_fields = ['nom', 'prix_vente', 'stock_actuel', 'date_expiration']
    ordering = ['nom']
    
    @action(detail=False, methods=['get'])
    def alerte_stock(self, request):
        """Retourne les médicaments avec stock < seuil minimum"""
        medicaments = self.get_queryset().filter(
            stock_actuel__lte=models.F('stock_minimum')
        )
        serializer = self.get_serializer(medicaments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def alerte_expiration(self, request):
        """Retourne les médicaments qui expirent dans moins de 30 jours"""
        from django.utils import timezone
        from datetime import timedelta
        
        date_limite = timezone.now().date() + timedelta(days=30)
        medicaments = self.get_queryset().filter(
            date_expiration__lte=date_limite
        )
        serializer = self.get_serializer(medicaments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Détail complet d'un médicament avec infos supplémentaires"""
        medicament = self.get_object()
        data = MedicamentSerializer(medicament).data
        
        # Ajouter des statistiques
        from apps.ventes.models import LigneVente
        ventes = LigneVente.objects.filter(
            medicament=medicament,
            vente__statut='completee'
        )
        
        data['statistiques'] = {
            'total_vendu': ventes.aggregate(total=models.Sum('quantite'))['total'] or 0,
            'derniere_vente': ventes.order_by('-vente__date_vente')
                                     .values('vente__date_vente')
                                     .first(),
            'chiffre_affaires': ventes.aggregate(ca=models.Sum('sous_total'))['ca'] or 0,
        }
        
        return Response(data)