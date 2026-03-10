from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Vente, LigneVente
from apps.medicaments.models import Medicament
from .serializers import VenteSerializer, LigneVenteSerializer

class VenteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Vente.objects.all()
    serializer_class = VenteSerializer

class VenteDetailAPIView(generics.RetrieveAPIView):
    queryset = Vente.objects.all()
    serializer_class = VenteSerializer

@api_view(['POST'])
def annuler_vente(request, pk):
    try:
        vente = Vente.objects.get(pk=pk)
    except Vente.DoesNotExist:
        return Response({"detail": "Vente non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    if vente.statut == 'annulee':
        return Response({"detail": "Vente déjà annulée"}, status=status.HTTP_400_BAD_REQUEST)

    # Réintégration du stock
    for ligne in vente.lignevente_set.all():
        ligne.medicament.stock_actuel += ligne.quantite
        ligne.medicament.save(update_fields=['stock_actuel'])

    vente.statut = 'annulee'
    vente.save(update_fields=['statut'])

    return Response({"detail": "Vente annulée avec succès"}, status=status.HTTP_200_OK)