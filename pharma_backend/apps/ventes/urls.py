# apps/ventes/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('ventes/', views.VenteListCreateAPIView.as_view(), name='ventes-list-create'),
    path('ventes/<int:pk>/', views.VenteDetailAPIView.as_view(), name='ventes-detail'),
    path('ventes/<int:pk>/annuler/', views.annuler_vente, name='ventes-annuler'),
]