import pytz
from datetime import datetime
from django.http import Http404
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User


from base.models import Restaurant, Promos, Location, RestaurantReview, Product
from base.serializers import RestaurantSerializer, LocationSerializer, PromosSerializer, RestaurantReviewSerializer



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
                restaurants = Restaurant.objects.filter(owner=owner).order_by('name')

            search = request.query_params.get('search')
            if search is not None and search != '':
                restaurants = Restaurant.objects.filter(name__contains=search).order_by('name')

            num_restaurant = len(restaurants)

            limit = request.query_params.get('limit')
            if limit is None:
                limit = 8

            # Get all restaurants without pagination
            if limit == 'all':
                serializer = RestaurantSerializer(restaurants, many=True)
                return Response(serializer.data)

            page = request.query_params.get('page')
            if page is None:
                page = 1

            page = int(page)
            limit = int(limit)

            paginator = Paginator(restaurants, limit)

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



@api_view(['POST'])
def upalod_logo (request, pk):
    try:
        restaurant = Restaurant.objects.get(_id=pk)
        # print('UPLOADING NEW LOGO ...')
        # print(request.FILES)
        if 'logo' not in request.FILES:
            return Response({'details' : 'Empty or Invalid Payload!'}, status=status.HTTP_400_BAD_REQUEST)
        restaurant.logo = request.FILES['logo']
        restaurant.save()
        return Response('Logo Uploaded Successfully!')
    except Restaurant.DoesNotExist:
        return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        error = 'Internal Server Error!' if repr(e) == '' else repr(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['PUT'])
def edit_restaurant_location(request, pk):
    try:
        data = request.data
        restaurant = Restaurant.objects.get(_id=pk)
        if 'address' not in data:
            return Response({'details' : 'Address is required*'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'district' not in data:
            return Response({'details' : 'District is required*'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'postal_code' not in data:
            return Response({'details' : 'Postal Code is required*'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'contact_number' not in data:
            return Response({'details' : 'Contact Number is required*'}, status=status.HTTP_400_BAD_REQUEST)
        location = Location.objects.get(restaurant=restaurant)
        location.address = data['address']
        location.district = data['district']
        location.postal_code = data['postal_code']
        location.contact_number = data['contact_number']
        location.save()
        serializer = RestaurantSerializer(restaurant)
        return Response(serializer.data)
    except Restaurant.DoesNotExist:
        return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if repr(e) == '' else repr(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PromoList (APIView):
    """
    # Get all promotions, Creae new promotion
    """

    def get (self, request, format=None):
        try:
            restaurant_id = request.query_params.get('restaurant')
            promos = None
            if restaurant_id is None:
                promos = Promos.objects.all().order_by('-created_at')
            else:
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                promos = Promos.objects.filter(restaurant=restaurant).order_by('-created_at')

            # get promotion by product id
            product_id = request.query_params.get('product')
            if product_id is not None:
                product = Product.objects.get(_id=product_id)
                promos = Promos.objects.filter(product=product).order_by('-created_at')

            serializer = PromosSerializer(promos, many=True)
            return Response(serializer.data)

        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def get_promos_by_product (self, product):
        return Promos.objects.filter(product=product).filter(expiry_date__gt=datetime.now())


    def validate_request (self, data):
        error = True
        if 'restaurant' not in data:
            message = 'Restaurant is Required*'
            return error, message
        elif 'product' not in data:
            message = 'Promoted Product is required'
            return error, message
        elif 'description' not in data:
            message = 'Description is Required'
            return error, message
        elif 'type' not in data:
            message = 'Promotion Type is required'
            return error, message
        elif 'expiry_date' not in data:
            message = 'Promotion Expiry Date is required'
            return error, message
        elif 'amount' not in data:
            message = 'Promotion amount is required'
            return error, message
        else:
            error = False
            return error, ''


    def post (self, request, *args, **kwargs):
        try:
            data = request.data
            error, message = self.validate_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            restaurant = Restaurant.objects.get(_id=data['restaurant'])
            product = Product.objects.get(_id=data['product'])
            if data['type'] == 'cash-off' and float(data['amount']) >= product.price:
                return Response({'details' : 'Promotion price cannot be grater than product price'}, status=status.HTTP_400_BAD_REQUEST)
            if len(self.get_promos_by_product(product)) > 0:
                return Response({'details' : 'Promotion existed with the same product!'}, status=status.HTTP_400_BAD_REQUEST)
            if restaurant._id != product.restaurant._id:
                return Response({'details' : 'Invalid Product!'}, status=status.HTTP_400_BAD_REQUEST)
            # print(data['amount'], type(data['amount']))
            # print(float(data['amount']))
            promo = Promos.objects.create(
                restaurant=restaurant,
                product=product,
                type=data['type'],
                description=data['description'],
                amount=float(data['amount']),
                expiry_date=pytz.utc.localize(datetime.strptime(data['expiry_date'], '%Y-%m-%d'))
            )
            serializer = PromosSerializer(promo)
            return Response(serializer.data)

        except Product.DoesNotExist:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PromoDetails (APIView):
    """
    # Get Promotion Details By Id
    # Delete Promotions by Id
    """

    def get_object (self, pk):
        try:
            return Promos.objects.get(_id=pk)
        except Promos.DoesNotExist:
            raise Http404


    def get (self, request, pk, format=None):
        try:
            promo = self.get_object(pk)
            serializer = PromosSerializer(promo)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'Promotion Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete (self, request, pk, format=None):
        try:
            promo = self.get_object(pk)
            promo.delete()
            return Response("", status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response({'details' : 'Promotion Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class RestaurantReviewList (APIView):
    """
    # Get Restaurant Reviews
    # Create Restaurant Reviews
    """

    def get (self, request, format=None):
        try:
            restaurant_id = request.query_params.get('restaurant')
            reviews = None
            if restaurant_id is None:
                reviews = RestaurantReview.objects.all().order_by('-created_at')
            else:
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                reviews = RestaurantReview.objects.filter(restaurant=restaurant).order_by('-created_at')

            num_reviews = len(reviews)

            page = request.query_params.get('page')
            if page is None:
                page = 1

            page = int(page)

            paginator = Paginator(reviews, 5);

            try:
                reviews = paginator.page(page)
            except PageNotAnInteger:
                reviews = paginator.page(1)
            except EmptyPage:
                reviews = paginator.page(paginator.num_pages)

            serializer = RestaurantReviewSerializer(reviews, many=True)
            return Response({
                'reviews' : serializer.data,
                'page' : page,
                'pages' : paginator.num_pages,
                'count' : num_reviews,
                'restaurant' : restaurant.name if restaurant is not None else None
            })

        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def validate_request (self, request):
        error = True
        if 'restaurant' not in request:
            message = 'Restaurant is required*'
            return error, message
        elif 'user' not in request:
            message = 'User is required*'
            return error, message
        elif 'rating' not in request:
            message = 'Rating is required*'
            return error, message
        elif type(request['rating']) != float and type(request['rating']) != int:
            message = 'Rating must be an integer or decimal number*'
            return error, message
        elif request['rating'] > 5 or request['rating'] < 0:
            message = 'Rating must be within 0 to 5.*'
            return error, message
        else:
            error = False
            return error, ''


    def post (self, request, *args, **kwargs):
        try:
            data = request.data
            error, message = self.validate_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            restaurant = Restaurant.objects.get(_id=data['restaurant'])
            user = User.objects.get(id=data['user'])
            if user.profile.type != 'customer':
                return Response({'details' : 'Invalid User!'}, status=status.HTTP_400_BAD_REQUEST)
            review = RestaurantReview.objects.create(
                restaurant=restaurant,
                user=user,
                rating=data['rating'],
                comment=data['comment'] if 'comment' in data else None
            )
            serializer = RestaurantReviewSerializer(review)
            return Response(serializer.data)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
