from rest_framework.routers import DefaultRouter
from .views import MedicamentViewSet

router = DefaultRouter()
router.register(r"medicaments", MedicamentViewSet)

urlpatterns = router.urls