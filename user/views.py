from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response

from user.models import User, Address, Avatar
from user.serializers import UserSerializer, AddressSerializer, AvatarSerializer, RegisterSerializer


# Create your views here.

@extend_schema(tags=["Users"])
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

@extend_schema(tags=["User Authentication"])
class RegisterViewSet(viewsets.GenericViewSet):
    serializer_class = RegisterSerializer

    @action(detail=False, methods=["post"], url_path="register", )
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            RegisterSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["User Avatars"])
class AvatarViewSet(viewsets.ModelViewSet):
    serializer_class = AvatarSerializer
    queryset = Avatar.objects.all()


@extend_schema(tags=["User Addresses"])
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
