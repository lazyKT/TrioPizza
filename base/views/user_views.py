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

from base.models import Profile, ShippingAddress
from base.serializers import ProductSerializer, UserSerializer, UserSerializerWithToken, ShippingAddressSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        print ('attrs', attrs)
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

    def get_user_by_username (self, username):
        user = User.objects.filter(username=username)
        return user


    def validate_request_body (self, body):
        if 'username' not in body:
            error = True
            message = 'Username is required!'
            return error, message
        if 'name' not in body:
            error = True
            message = 'Full Name is required!'
            return error, message
        if 'type' not in body:
            error = True
            message = 'User Type is required!'
            return error, message
        if body['type'] != 'customer' and body['type'] != 'driver' and body['type'] != 'admin':
            error = True
            message = 'Invalid User Type!'
            return error, message
        if 'mobile' not in body:
            error = True
            message = 'Mobile is required!'
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

            user = User.objects.create(
                username=data['username'],
                password=make_password(data['password'])
            )

            profile = user.profile
            profile.type = data['type']
            profile.name = data['name']
            profile.mobile = data['mobile']
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

    permission_classes = (IsAuthenticated, )

    def get_object (self, pk):
        """
        # Get User by Id
        """
        try:
            return User.objects.get(id=pk)
        except User.DoesNotExist:
            raise Http404


    def validate_request_body (self, body):
        if 'username' not in body:
            error = True
            message = 'Username is required!'
            return error, message
        if 'name' not in body:
            error = True
            message = 'Full Name is required!'
            return error, message
        if 'type' not in body:
            error = True
            message = 'User Type is required!'
            return error, message
        if body['type'] != 'customer' and body['type'] != 'driver' and body['type'] != 'admin':
            error = True
            message = 'Invalid User Type!'
            return error, message
        if 'mobile' not in body:
            error = True
            message = 'Mobile is required!'
            return error, message
        return False, ''


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


    def get (self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)


    def put (self, request, pk, format=None):
        try:
            user = self.get_object (pk)
            data = request.data

            error, message = self.validate_request_body (data)
            if error:
                return Response ({'details': message}, status=status.HTTP_400_BAD_REQUEST)

            is_valid, message = self.validate_username(user.username, data['username'])
            if is_valid is not True:
                return Response ({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(user, data=data)
            if serializer.is_valid():
                serializer.save()
                profile = user.profile
                profile.name = data['name']
                profile.type = data['type']
                profile.mobile = data['mobile']
                profile.save()
                return Response (serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = repr(e)
            return Response ({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete (self, request, pk, format=None):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class ShippingAddressList (APIView):
    """
    # Users' saved shipping address
    """

    def get (self, request, format=None):
        return ShippingAddress.objects.all()


    def get_user (self, pk):
        try:
            return User.objects.get(id=pk)
        except User.DoesNotExist:
            raise Http404


    def gen_address_name (self, user):
        addresses = self.ShippingAddress.objects.filter(user=user)
        addr_len = len(addresses)
        return 'My Address %s' % str(addr_len+1)


    def validate_request_body (self, request_body):
        error = True
        if 'user' not in request_body:
            return error, 'User field is required*'
        elif 'name' not in request_body:
            return error, 'Address Name Field is required*'
        elif 'address' not in request_body:
            return error, 'Address Field is required*'
        elif 'city' not in request_body:
            return error, 'City is required*'
        elif 'postalCode' not in request_body:
            return error, 'Postal Code is required*'
        elif 'country' not in request_body:
            return error, 'Country is required*'
        else:
            error = False
            return error, ''


    def post (self, request, format=None):
        try:
            data = request.data
            # validate request body
            error, message = self.validate_request_body(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            user = self.get_user(data['user'])
            addr_name = data['name']
            if addr_name == '':
                addr_name = self.gen_address_name(user)
            # save new address
            address = ShippingAddress.objects.create(
                user=user,
                name=addr_name,
                address=data['address'],
                country=data['country'],
                postalCode=data['postalCode'],
                city=data['city']
            )
            serializer = ShippingAddressSerializer(address)
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Server Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ShippingAddressDetails (APIView):
    """
    # GET/EDIT/DELETE shipping address
    """

    def get_object (self, pk):
        try:
            return ShippingAddress.objects.get(_id=pk)
        except ShippingAddress.DoesNotExist:
            raise Http404


    def get_user (self, pk):
        try:
            return User.objects.get(id=pk)
        except User.DoesNotExist:
            raise Http404


    def gen_address_name (self, user):
        addresses = self.ShippingAddress.objects.filter(user=user)
        addr_len = len(addresses)
        return 'My Address %s' % str(addr_len+1)


    def validate_request_body (self, request_body):
        error = True
        if 'user' not in request_body:
            return error, 'User field is required*'
        elif 'name' not in request_body:
            return error, 'Address Name Field is required*'
        elif 'address' not in request_body:
            return error, 'Address Field is required*'
        elif 'city' not in request_body:
            return error, 'City is required*'
        elif 'postalCode' not in request_body:
            return error, 'Postal Code is required*'
        elif 'country' not in request_body:
            return error, 'Country is required*'
        else:
            error = False
            return error, ''


    def get (self, request, pk, format=None):
        address = self.get_object(self, pk)
        serializer = ShippingAddressSerializer(address)
        return Response(serializer.data)


    def put (self, request, pk, format=None):
        try:
            address = self.get_object(pk)
            data = request.data
            # validate reqeuest data
            error, message = self.validate_request_body (data)
            if error:
                return Response({'details' : error}, status=status.HTTP_400_BAD_REQUEST)
            user = self.get_user(data['user'])
            addr_name = data['name']
            if addr_name == '':
                addr_name = self.gen_address_name(user)
                data['name'] = addr_name

            serializer = ShippingAddressSerializer(address, data=data)
            if serializer.is_valid:
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            error = 'Internal Server Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_user_saved_addresses (request, pk):
    """
    # Get User Saved Addresses
    """
    try:
        user = User.objects.get(id=pk)
        addresses = ShippingAddress.objects.filter(user=user)
        serializer = ShippingAddressSerializer(addresses, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
