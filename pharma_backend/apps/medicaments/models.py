from django.db import models
from apps.categories.models import Categorie

class Medicament(models.Model):
    nom = models.CharField(max_length=255)
    dci = models.CharField(max_length=255)
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT, related_name='medicaments')
    forme = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    stock_actuel = models.IntegerField()
    stock_minimum = models.IntegerField()
    date_expiration = models.DateField()
    ordonnance_requise = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    est_actif = models.BooleanField(default=True)
    categorie = models.ForeignKey(
        Categorie, 
        on_delete=models.PROTECT, 
        related_name='medicaments'
    )

    @property
    def stock_alert(self):
        return self.stock_actuel <= self.stock_minimum

    def __str__(self):
        return self.nom