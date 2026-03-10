# apps/ventes/serializers.py
from rest_framework import serializers
from .models import Vente, LigneVente

class LigneVenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneVente
        fields = ['id', 'medicament', 'quantite', 'prix_unitaire', 'sous_total']

class VenteSerializer(serializers.ModelSerializer):
    # Utilisez le related_name défini dans le modèle
    lignes = LigneVenteSerializer(many=True, read_only=True, source='lignevente_set')
    
    class Meta:
        model = Vente
        fields = ['id', 'reference', 'date_vente', 'total_ttc', 'statut', 'notes', 'lignes']
        read_only_fields = ['reference', 'total_ttc']

class VenteCreateSerializer(serializers.ModelSerializer):
    lignes = LigneVenteSerializer(many=True)
    
    class Meta:
        model = Vente
        fields = ['lignes', 'notes']
    
    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes')
        vente = Vente.objects.create(**validated_data)
        
        for ligne_data in lignes_data:
            LigneVente.objects.create(vente=vente, **ligne_data)
        
        # Mettre à jour le total
        vente.save()  # Le save() du modèle recalcule le total
        return vente
    
    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Au moins un article est requis")
        
        for ligne in value:
            if ligne['quantite'] <= 0:
                raise serializers.ValidationError("La quantité doit être positive")
        return value