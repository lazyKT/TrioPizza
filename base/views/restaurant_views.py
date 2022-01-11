from django.http import Http404
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User


from base.models import Restaurant, Promos, Location, RestaurantReview
from base.serializers import RestaurantSerializer, LocationSerializer



class RestaurantList (APIView):
    """
    # Get All the Restaurants, Create new restaurnats
    """

    def get_restaurant_by_name (self, name):
        restaurants = Restaurant.objects.filter(name=name)
        return restaurants

    def get_restaurnat_by_owner (self, owner):
        return Restaurant.objects.filter(owner=owner)


    def get (self, request, format=None):
        try:
            restaurants = None

            keyword = request.query_params.get('owner')
            if keyword is None:
                restaurants = Restaurant.objects.all().order_by('name')
            else:
                owner = User.objects.get(id=keyword)
                restaurants = Restaurant.objects.filter(owner=owner)

            num_restaurant = len(restaurants)

            page = request.query_params.get('page')
            if page is None:
                page = 1

            page = int(page)

            paginator = Paginator(restaurants, 8)

            try:
                restaurants = paginator.page(page)
            except PageNotAnInteger:
                restaurants = paginator.page(1)
            except EmptyPage:
                restaurants = paginator.page(paginator.num_pages)

            serializer = RestaurantSerializer(restaurants, many=True)
            return Response({'restaurants' : serializer.data, 'page' : page, 'pages' : paginator.num_pages, 'count' : num_restaurant})
        except User.DoesNotExist:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response ({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def get_owner (self, owner_id):
        try:
            return User.objects.get(id=owner_id)
        except User.DoesNotExist:
            raise Http404


    def validate_request (self, body):
        error = True
        message = ''
        if 'name' not in body:
            message = 'Restaurant Name is Required*'
            return error, message
        elif 'owner' not in body:
            message = 'Restaurant Owner is Required*'
            return error, message
        elif 'address' not in body:
            message = 'Address is Required*'
            return error, message
        elif 'district' not in body:
            message = 'District is Required'
            return error, message
        elif 'postal_code' not in body:
            message = 'Postal Code is Required*'
            return error, message
        elif 'contact_number' not in body:
            message = 'Contact Number is Required*'
            return error, message
        else:
            error = False
            return error, ''


    def create_restaurant (self, name, owner, description=''):
        return Restaurant.objects.create(
            name=name,
            owner=owner,
            description=description
        )


    def create_restaurant_location (self, restaurant, address, district, postal_code, contact_number):
        location = Location.objects.create(
            restaurant=restaurant,
            address=address,
            district=district,
            postal_code=postal_code,
            contact_number=contact_number
        )


    def post (self, request, *args, **kwargs):
        try:
            data = request.data
            error, message = self.validate_request (data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            owner = self.get_owner(data['owner'])
            if owner.profile.type != 'restaurant owner':
                return Response({'details' : 'Invalid User Type!'}, status=status.HTTP_400_BAD_REQUEST)

            if (len(self.get_restaurnat_by_owner(owner))):
                return Response({'details' : 'Error! Cannot add more than one restaurant'}, status=status.HTTP_400_BAD_REQUEST)

            if len(self.get_restaurant_by_name(data['name'])) > 0:
                error = 'Restaurant with %s already existed' % data['name']
                return Response({'details' : error}, status=status.HTTP_400_BAD_REQUEST)

            description = '' if 'description' not in data else data['description']
            restaurant = self.create_restaurant(data['name'], owner, description)
            self.create_restaurant_location(restaurant, data['address'], data['district'], data['postal_code'], data['contact_number'])
            serializer = RestaurantSerializer(restaurant)
            return Response(serializer.data)

        except Http404:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class RestaurantDetails (APIView):
    """
    # Get/Edit Restaurant Details
    # Delete Restaurant
    """

    def get_object (self, pk):
        try:
            return Restaurant.objects.get(_id=pk)
        except Restaurant.DoesNotExist:
            raise Http404


    def get (self, request, pk, format=None):
        try:
            restaurant = self.get_object(pk)
            serializer = RestaurantSerializer(restaurant)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def get_restaurant_by_name (self, pk, name):
        return Restaurant.objects.filter(~Q(_id=pk)).filter(name=name)


    def validate_edit_request (self, body):
        error = True
        message = ''
        if 'name' not in body:
            message = 'Restaurant Name is Required*'
            return error, message
        elif 'owner' not in body:
            message = 'Restaurant Owner is Required*'
            return error, message
        else:
            error = False
            return error, ''


    def put (self, request, pk, format=None):
        try:
            data = request.data
            restaurant = self.get_object(pk)
            error, message = self.validate_edit_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            owner = User.objects.get(id=data['owner'])
            if owner.profile.type != 'restaurant owner':
                return Response({'details' : 'Invalid User Type!'}, status=status.HTTP_400_BAD_REQUEST)

            if len(self.get_restaurant_by_name(pk, data['name'])) > 0:
                error = 'Restaurant with %s already existed' % data['name']
                return Response({'details' : error}, status=status.HTTP_400_BAD_REQUEST)

            restaurant.name = data['name']
            restaurant.owner = owner
            restaurant.description = '' if 'description' not in data else data['description']
            restaurant.save()
            serializer = RestaurantSerializer(restaurant)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
