import pytz
from hashlib import sha256
from datetime import datetime, timedelta
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

from base.utils import send_email, get_email_template
from base.models import Profile, ShippingAddress, DriverOrderStatus, Order, TempURL
from base.serializers import (
    ProductSerializer,
    UserSerializer,
    UserSerializerWithToken,
    ProfileSerializer,
    ShippingAddressSerializer,
    DriverOrderStatusSerializer
)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
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
        if body['type'] != 'customer' and body['type'] != 'driver' and body['type'] != 'admin' and body['type'] != 'restaurant owner':
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
        try:
            user_type = request.query_params.get('type')
            users = None
            if user_type is not None:
                users = Profile.objects.filter(type=user_type)
                serializer = ProfileSerializer(users, many=True)
                return Response(serializer.data)
            search = request.query_params.get('search')
            if search is not None and search != '':
                users = User.objects.filter(username__contains=search)
            else:
                users = User.objects.all()
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Server Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def create_new_driver_record (self, driver):
        try:
            record = DriverOrderStatus.objects.create(
                driver=driver,
                total_order=0
            )
        except Exception as e:
            raise e


    def send_welcome_email (self, user_type, name, email):
        if user_type == 'customer':
            email_template = get_email_template('wlc_customer')
            data = { "name" : name }
            send_email([email], email_template, data)
        elif user_type == 'restaurant owner':
            email_template = get_email_template('wlc_rest_owner')
            data = { "name" : name }
            send_email([email], email_template, data)


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
            if data['type'] == 'driver':
                self.create_new_driver_record (user)
            serializer = UserSerializer (user)
            # send welcome email
            self.send_welcome_email(data['type'], data['name'], data['username'])
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
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
        if body['type'] != 'customer' and body['type'] != 'driver' and body['type'] != 'admin' and body['type'] != 'restaurant owner':
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
        # try:
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
        # except Exception as e:
        #     error = repr(e)
        #     return Response ({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete (self, request, pk, format=None):
        try:
            user = self.get_object(pk)
            # Delete Driver
            if user.profile.type == 'driver':
                driver_status = DriverOrderStatus.objects.get(driver=user)
                if driver_status.active_orders < 1 and driver_status.status == "offline":
                    driver_status.delete()
                else:
                    return Response({'details' : 'Error! Cannot Delete the Active Driver!'}, status=status.HTTP_400_BAD_REQUEST)
            # Delete Customer
            elif user.profile.type == 'customer':
                cust_orders = Order.objects.filter(user=user).filter(status='progress')
                if len(cust_orders) > 0:
                    return Response({'details' : 'Error! Cannot Delete the Active Customer!'}, status=status.HTTP_400_BAD_REQUEST)
            # Delete Admin
            elif user.profile.type == 'admin':
                return Response({'details' : 'Error! Cannot Delete Admin User!'}, status=status.HTTP_400_BAD_REQUEST)

            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DriverOrderStatus.DoesNotExist:
            return Response({'details' : 'Driver Status Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'details' : 'User Not Found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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


@api_view(['POST'])
def create_new_driver_record (request):
    try:
        if 'driver' not in request.data:
            return Response({'details' : 'Field, driver, is required*'}, status=status.HTTP_400_BAD_REQUEST)
        if type(request.data['driver']) != int:
            return Response({'details' : 'Content of field, driver, must be int*'}, status=status.HTTP_400_BAD_REQUEST)
        driver_id = request.data['driver']
        driver = User.objects.get(id=driver_id)
        if driver.profile.type != 'driver':
            return Response({'details' : 'Invalid Driver!'}, status=status.HTTP_400_BAD_REQUEST)
        existing_records = DriverOrderStatus.objects.filter(driver=driver)
        if len(existing_records) > 0:
            return Response({'details' : 'Driver record already exists'}, status=status.HTTP_400_BAD_REQUEST)
        new_record = DriverOrderStatus.objects.create(
            driver = driver,
            current_order = None,
            total_order = 0
        )
        serializer = DriverOrderStatusSerializer(new_record)
        return Response(serializer.data)
    except DriverOrderStatus.DoesNotExist:
        return Response({'details' : 'Driver Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_all_driver_status (request):
    try:
        statuses = DriverOrderStatus.objects.all()
        serializer = DriverOrderStatusSerializer(statuses, many=True)
        return Response(serializer.data)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_all_avaialble_drivers (request):
    try:
        drivers = DriverOrderStatus.objects.filter(status='available')
        serializer = DriverOrderStatusSerializer(drivers, many=True)
        return Response(serializer.data)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_driver_status_by_id (request, pk):
    try:
        user = User.objects.get(id=pk)
        driver_status = DriverOrderStatus.objects.get(driver=user)
        serializer = DriverOrderStatusSerializer(driver_status)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except DriverOrderStatus.DoesNotExist:
        return Response({'details' : 'Driver Status Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['PUT'])
def update_driver_status (request):
    try:
        data = request.data
        if 'driver' not in data:
            return Response({'details' : 'Driver is required*'}, status=status.HTTP_400_BAD_REQUEST)
        if 'status' not in data:
            return Response({'details' : 'Status is required*'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(id=data['driver'])
        if user.profile.type != 'driver':
            return Response({'details' : 'Invalid Driver!'}, status=status.HTTP_400_BAD_REQUEST)

        driver_status = DriverOrderStatus.objects.get(driver=user)

        if data['status'] != 'offline' and data['status'] != 'available':
            return Response({'details' : 'Invalid Status!'}, status=status.HTTP_400_BAD_REQUEST)

        driver_status.status = data['status']
        driver_status.save()
        serializer = DriverOrderStatusSerializer(driver_status)
        return Response(serializer.data)

    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)

    except DriverOrderStatus.DoesNotExist:
        return Response({'details' : 'Driver Status Not Found!'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def gen_password_reset_link (request):
    try:
        data = request.data
        if 'email' not in data:
            return Response({'details' : 'Email is required*'})
        user = User.objects.get(username=data['email'])
        sg_tz = pytz.timezone('Asia/Singapore')
        tempURL = TempURL.objects.create(
            email = user.username,
            token = sha256(f"{user.username}{str(datetime.utcnow().timestamp())}".encode('utf-8')).hexdigest(),
            expire_time = datetime.now(tz=sg_tz) + timedelta(minutes=10)
        )
        email_template = get_email_template('forgot_password')
        data = {
            "name" : "Kyaw",
            "link" : f"<a style=\"padding: 10px; background: coral; color: white;\" href=\"{tempURL.get_reset_link()}\">Reset Password</a>"
        }
        send_email ([user.username], email_template, data)
        return Response({'details' : 'Password Reset Link has been sent. Please Check your email!'})
    except User.DoesNotExist:
        return Response({'details' : 'User not found with given email!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def reset_password (request):
    try:
        data = request.data
        if 'email' not in data or 'password' not in data:
            return Response({'details' : 'Email and Password is required*'}, status=status.HTTP_400_BAD_REQUEST)
        if 'token' not in data:
            return Response({'details' : 'Invalid Token*'}, status=status.HTTP_400_BAD_REQUEST)
        if 'expiry' not in data:
            return Response({'details' : 'Invalid or Empty Time Stamp'}, status=status.HTTP_400_BAD_REQUEST)
        tmp_link = TempURL.objects.get(token=data['token'])
        sg_tz = pytz.timezone('Asia/Singapore')
        expiry = pytz.utc.localize(datetime.strptime(data['expiry'], '%Y-%m-%dT%H:%M:%S'))
        token_expire_time = tmp_link.expire_time.astimezone(sg_tz)

        # check requested email
        if data['email'] != tmp_link.email:
            return Response({'details' : 'Wrong Email'}, status=status.HTTP_401_UNAUTHORIZED)
        # compare link expire times
        if expiry.date() != token_expire_time.date() or expiry.hour != token_expire_time.hour or expiry.minute != token_expire_time.minute:
            return Response({'details' : 'Invalid Token and TimeStamp!'}, status=status.HTTP_403_FORBIDDEN)

        if token_expire_time < datetime.now(tz=sg_tz):
            return Response({'details' : 'Token Expired!'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.get(username=data['email'])
        user.password = make_password(data['password'])
        user.save()
        return Response(f"Password change for {user.username}")
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found with give email!'}, status=status.HTTP_404_NOT_FOUND)
    except TempURL.DoesNotExist:
        return Response({'details' : 'Invalid Request!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
