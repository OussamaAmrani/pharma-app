# apps/categories/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategorieViewSet)

urlpatterns = [
    path('', include(router.urls)),
]