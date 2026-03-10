from django.db import models
from apps.medicaments.models import Medicament
from django.utils import timezone
from django.db.models import F

class Vente(models.Model):
    STATUS_CHOICES = [
        ('en_cours', 'En cours'),
        ('completee', 'Complétée'),
        ('annulee', 'Annulée')
    ]

    reference = models.CharField(max_length=20, unique=True, editable=False)
    date_vente = models.DateTimeField(default=timezone.now)
    total_ttc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    statut = models.CharField(max_length=10, choices=STATUS_CHOICES, default='en_cours')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.reference

    def save(self, *args, **kwargs):
        if not self.reference:
            # Auto-génération simple : VNT-2026-0001
            last_id = Vente.objects.all().count() + 1
            self.reference = f"VNT-{timezone.now().year}-{last_id:04d}"
        super().save(*args, **kwargs)
        # Met à jour le total
        total = sum(l.sous_total for l in self.lignevente_set.all())
        if self.total_ttc != total:
            self.total_ttc = total
            super().save(update_fields=['total_ttc'])

class LigneVente(models.Model):
    vente = models.ForeignKey(Vente, on_delete=models.CASCADE)
    medicament = models.ForeignKey(Medicament, on_delete=models.PROTECT)
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    sous_total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        # Calcul du sous_total
        self.sous_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)

        # Déduction automatique du stock
        if self.vente.statut != 'annulee':
            self.medicament.stock_actuel = F('stock_actuel') - self.quantite
            self.medicament.save(update_fields=['stock_actuel'])