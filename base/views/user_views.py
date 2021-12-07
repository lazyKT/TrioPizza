from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import status

from base.models import Profile
from base.serializers import ProductSerializer, UserSerializer, UserSerializerWithToken


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
            print(k, v)
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserList (APIView):
    """
    # Get All Users, Create New Users
    """

    def get_user_by_email (self, email):
        user = User.objects.filter(email=email)
        return user

    def get_user_by_username (self, username):
        user = User.objects.filter(username=username)
        return user

    def validate_request_body (self, body):
        if 'username' not in body:
            error = True
            message = 'Username is required!'
            return error, message
        if 'email' not in body:
            error = True
            message = 'Email Address is required!'
            return error, message
        if 'first_name' not in body:
            error = True
            message = 'Firstname is required!'
            return error, message
        if 'last_name' not in body:
            error = True
            message = 'Lastname is required!'
            return error, message
        if 'type' not in body:
            error = True
            message = 'User Type is required!'
            return error, message
        if body['type'] != 'customer' and body['type'] != 'driver':
            error = True
            message = 'Invalid User Type!'
            return error, message
        return False, ''

    def get (self, request, format=None):
        """
        # Get All Users
        """
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post (self, request, *args, **kwargs):
        """
        # Create New Users
        """
        try:
            data = request.data
            error, message = self.validate_request_body(data)
            if error:
                return Response ({'details': message}, status=status.HTTP_400_BAD_REQUEST)
            # Check user by username
            user = self.get_user_by_username(data['username'])
            if len(user) > 0:
                error = 'User already exists with username, %s' % data['username']
                return Response ({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
            # Check user by email
            user = self.get_user_by_email (data['email'])
            if len(user) > 0:
                error = 'User already exists with email, %s' % data['email']
                return Response ({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.create(
                first_name=data['first_name'],
                last_name=data['last_name'],
                username=data['username'],
                email=data['email'],
                password=make_password(data['password'])
            )

            profile = user.profile
            profile.type = data['type']
            profile.save()
            print('user profile saved!')
            serializer = UserSerializer (user)
            print('serializer.data', serializer.data)
            return Response(serializer.data)
        except Exception as e:
            error = repr(e)
            return Response ({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserDetails (APIView):
    """
    # GET/PUT/DELETE user by ID
    """

    def get_object (self, pk):
        """
        # Get User by Id
        """
        try:
            return User.objects.get(id=pk)
        except User.DoesNotExist:
            raise Http404


    def get_user_by_email (self, email):
        return User.objects.filter(email=email)


    def get_user_by_username (self, username):
        return User.objects.filter(username=username)


    def validate_username (self, username, new_username):
        if username == new_username:
            return True, ''
        user = self.get_user_by_username (new_username)
        if len(user) > 0:
            message = 'Username, %s, is already taken by other user' % new_username
            return False, message
        return True, ''


    def validate_email (self, email, new_email):
        if email == new_email:
            return True, ''
        user = self.get_user_by_email (new_email)
        if len(user) > 0:
            message = 'Email Address, %s, is already taken by other user' % new_email
            return False, message
        return True, ''


    def get (self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)


    def put (self, request, pk, format=None):
        user = self.get_object (pk)
        data = request.data

        is_valid, message = self.validate_username(user.username, data['username'])
        if is_valid is not True:
            return Response ({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, message = self.validate_email (user.email, data['email'])
        if is_valid is not True:
            return Response ({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user, data=data)
        if serializer.is_valid():
            serializer.save()
            profile = user.profile
            profile.type = data['type']
            profile.save()
            return Response (serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete (self, request, pk, format=None):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



# @api_view(['POST'])
# def registerUser(request):
#     data = request.data
#     try:
#
#         user = User.objects.filter(username=data['username'])
#         if user:
#             error = 'User already exists with username, %s' % data['username']
#             return Response ({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
#
#         user = User.objects.filter(email=data['email'])
#         if user:
#             error = 'User already exists with email, %s' % data['email']
#             return Response ({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
#
#         if 'type' not in data:
#             error = 'Type is required*'
#             return Response ({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
#
#         if data['type'] != 'customer' and data['type'] != 'driver':
#             error = 'Invalid User Type, %s' % data['type']
#             return Response ({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
#
#         user = User.objects.create(
#             first_name=data['first_name'],
#             last_name=data['last_name'],
#             username=data['username'],
#             email=data['email'],
#             password=make_password(data['password'])
#         )
#         profile = user.profile
#         profile.type = data['type']
#         profile.save()
#
#         serializer = UserSerializerWithToken(user, many=False)
#         return Response(serializer.data)
#
#     except Exception as e:
#         print (e)
#         message = {'detail': repr(e)}
#         return Response(message, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user, many=False)

    data = request.data
    user.first_name = data['name']
    user.username = data['email']
    user.email = data['email']

    if data['password'] != '':
        user.password = make_password(data['password'])

    user.save()

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUserById(request, pk):
    user = User.objects.get(id=pk)
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUser(request, pk):
    user = User.objects.get(id=pk)

    data = request.data

    user.first_name = data['name']
    user.username = data['email']
    user.email = data['email']
    user.is_staff = data['isAdmin']

    user.save()

    serializer = UserSerializer(user, many=False)

    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    userForDeletion = User.objects.get(id=pk)
    userForDeletion.delete()
    return Response('User was deleted')
