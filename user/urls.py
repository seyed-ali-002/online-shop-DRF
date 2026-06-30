from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from user.views import UserViewSet, RegisterViewSet, AddressViewSet, AvatarViewSet

router = DefaultRouter()
router.register('', UserViewSet, basename='user')
router.register('auth', RegisterViewSet, basename='auth')
router.register('address', AddressViewSet, basename='address')
router.register('avatar', AvatarViewSet, basename='avatar')
urlpatterns = [
    path('', include(router.urls)),
    path('auth/login', TokenObtainPairView.as_view(), name="login"),
    path('auth/refresh/', TokenRefreshView.as_view(), name="refresh"),
]
