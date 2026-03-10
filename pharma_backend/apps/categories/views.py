# apps/categories/views.py
from rest_framework import viewsets
from .models import Categorie
from .serializers import CategorieSerializer

class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer