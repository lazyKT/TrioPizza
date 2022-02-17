import pytz
from datetime import datetime, timedelta
from django.db.models import Count, DateField
from django.db.models.functions import TruncDate
from django.http import Http404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from base.utils import send_email, get_email_template
from base.models import User, Reservation, Product, Restaurant, PreOrder
from base.serializers import ReservationSerializer, RestaurantSerializer



class ReservationList (APIView):
    """
    # Get List of Reservations
    # Create new Reservations
    """

    def get (self, request, format=None):
        """
        # Get Reservation Lists
        """
        try:
            restaurant_id = request.query_params.get('restaurant')
            reservations = Reservation.objects.all().order_by('-reservedDateTime')
            _date = request.query_params.get('date')
            _datetime = request.query_params.get('datetime')

            if restaurant_id is not None and _date is not None:
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                date = datetime.strptime(_date, '%Y-%m-%d')
                reservations = Reservation.objects.filter(restaurant=restaurant).filter(
                    reservedDateTime__gte=date, reservedDateTime__lte=(date+timedelta(days=1))
                ).order_by('-reservedDateTime')

            elif restaurant_id is not None and _datetime is not None:
                print(_datetime)
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                dateTime = datetime.strptime(_datetime, '%Y-%m-%d %I:%M %p')
                reservations = Reservation.objects.filter(restaurant=restaurant).filter(
                    reservedDateTime=dateTime
                ).order_by('-reservedDateTime')

            elif restaurant_id is not None:
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                reservations = Reservation.objects.filter(restaurant=restaurant).order_by('-reservedDateTime')

            serializer = ReservationSerializer(reservations, many=True)
            return Response({'reservations' : serializer.data, 'count': len(reservations)})

        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def get_user_by_id (self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise Http404


    def validate_request_body (self, data):
        error = True
        if 'user' not in data:
            return error, 'User Must Not Be Empty*'
        elif 'restaurant' not in data:
            return error, 'Restaurant Must Not Be Empty*'
        elif 'num_of_pax' not in data:
            return error, 'Number of Pax is Required*'
        elif type(data['num_of_pax']) != int:
            return error, 'Number of Pax must be an integer type*'
        elif data['num_of_pax'] < 1:
            return error, 'Number of Pax must be at least 1'
        elif 'reservedDateTime' not in data:
            return error, 'Reservation Date and Time is Required*'
        else:
            error = False
            return error, ''


    def create_preorder_items (self, items, reservation):
        """
        # Create Pre-Order Items for Reservation
        """
        try:
            for item in items:
                product = Product.objects.get(_id=item['_id'])
                orderItem = PreOrder.objects.create(
                    product=product,
                    qty=item['qty'],
                    reservation=reservation,
                    price=item['price']
                )
        except Product.DoesNotExist:
            raise Exception('Product Not Found!')


    def post (self, request, format=None):
        """
        # Create New Reservations
        """
        try:
            data = request.data
            error, message = self.validate_request_body (data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            user = self.get_user_by_id (data['user'])
            if user.profile.type != 'customer':
                return Response({'details' : 'Invalid User Type'}, status=status.HTTP_400_BAD_REQUEST)

            restaurant = Restaurant.objects.get(_id=data['restaurant'])

            reservedDateTime = datetime.strptime(data['reservedDateTime'], '%Y-%m-%d %I:%M %p')
            reservation = Reservation.objects.create(
                user=user,
                restaurant=restaurant,
                num_of_pax=data['num_of_pax'],
                reservedDateTime=reservedDateTime # add timezone to create timezone aware datetime object
            )
            if 'preOrderItems' in data:
                self.create_preorder_items (data['preOrderItems'], reservation)

            cust_email_template = get_email_template('reservation_customer')
            cust_email_addr = user.username
            owner_email_template = get_email_template('reservation_restowner')
            owner_email_addr = restaurant.owner.username

            email_data = {
                "date_time" : data['reservedDateTime'],
                "num_pax" : data['num_of_pax'],
                "pre_order" : 'Yes' if len(data['preOrderItems']) > 0 else 'No',
                "restaurant_name" : restaurant.name
            }

            send_email([cust_email_addr], cust_email_template, email_data) # send reservation info email to customer
            send_email([owner_email_addr], cust_email_template, email_data) # send reservation info email to restaurant owner

            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ReservationDetails (APIView):
    """
    # Get Reservation by Id
    # Edit Reservation by Id
    # Delete Reservation by Id
    """

    def get_object (self, pk):
        try:
            return Reservation.objects.get(_id=pk)
        except Reservation.DoesNotExist:
            raise Http404


    def get (self, request, pk, format=None):
        try:
            reservation = self.get_object(pk)
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def validate_num_pax (self, num_of_pax):
        if type(num_of_pax) != int:
            return False
        elif num_of_pax < 1:
            return False
        else:
            return True


    def put (self, request, pk, format=None):
        try:
            data = request.data
            reservation = self.get_object(pk)
            if 'status' in data:
                reservation.status = data['status']
            if 'reservedDateTime' in data:
                reservedDateTime = datetime.strptime(data['reservedDateTime'], '%Y-%m-%d %I:%M %p')
                reservation.reservedDateTime = reservedDateTime
            if 'num_of_pax' in data and self.validate_num_pax(data['num_of_pax']):
                reservation.num_of_pax = data['num_of_pax']
            reservation.save()
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete (self, request, pk, format=None):
        try:
            reservation = self.get_object(pk)
            reservation.delete()
            return Response('', status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_users_reservation (request, pk):
    try:
        user = User.objects.get(id=pk)
        reservations = Reservation.objects.filter(user=user).order_by('-_id')

        page = request.query_params.get('page')
        if page is None:
            page = 1

        page = int(page)

        paginator = Paginator(reservations, 10)

        try:
            reservations = paginator.page(page)
        except PageNotAnInteger:
            reservations = paginator.page(1)
        except EmptyPage:
            reservations = paginator.page(paginator.num_pages)

        serializer = ReservationSerializer(reservations, many=True)
        return Response({'reservations' : serializer.data, 'page' : page, 'pages' : paginator.num_pages })
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_reservations_by_timeslot (request, pk):
    try:
        _date1 = request.query_params.get('date1')
        _date2 = request.query_params.get('date2')
        restaurant = Restaurant.objects.get(_id=pk)
        reservations = Reservation.objects.filter(restaurant=restaurant)
        if _date1 is None:
            return Response({'details' : 'Start Date is required*'}, status=status.HTTP_400_BAD_REQUEST)
        if _date2 is None:
            return Response({'details' : 'Start Date is required*'}, status=status.HTTP_400_BAD_REQUEST)
        date1 = datetime.strptime(_date1, '%Y-%m-%d')
        date2 = datetime.strptime(_date2, '%Y-%m-%d')
        reservations = Reservation.objects.filter(
            reservedDateTime__gte=date1, reservedDateTime__lte=date2 # greater than date1 and less than and equal to date2
        ).filter(
            restaurant=restaurant
        ).filter(status='active').values('reservedDateTime').annotate(count=Count('reservedDateTime'))
        return Response(reservations)
    except Restaurant.DoesNotExist:
        return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_reservations_by_day (request, pk):
    try:
        sg_tz = pytz.timezone('Asia/Singapore')
        _date1 = request.query_params.get('date1')
        _date2 = request.query_params.get('date2')
        restaurant = Restaurant.objects.get(_id=pk)
        reservations = Reservation.objects.filter(restaurant=restaurant)

        if _date1 is None:
            return Response({'details' : 'Start Date is required*'}, status=status.HTTP_400_BAD_REQUEST)
        if _date2 is None:
            return Response({'details' : 'Start Date is required*'}, status=status.HTTP_400_BAD_REQUEST)

        date1 = datetime.strptime(_date1, '%Y-%m-%d').astimezone(sg_tz)
        date2 = datetime.strptime(_date2, '%Y-%m-%d').astimezone(sg_tz)

        reservations_per_day = Reservation.objects.filter(
            reservedDateTime__gte=date1, reservedDateTime__lte=date2 # greater than date1 and less than and equal to date2
        ).filter(restaurant=restaurant).filter(status='active').annotate(
            day=TruncDate('reservedDateTime', output_field=DateField()),
        ).values('day').annotate(count=Count('reservedDateTime'))

        return Response(reservations_per_day)
    except Restaurant.DoesNotExist:
        return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_users_featured_restaurants (request, pk):
    try:
        user = User.objects.get(id=pk)
        reservations = Reservation.objects.filter(user=user).values('restaurant').annotate(
            count=Count('restaurant')
        )
        sorted_list = sorted(
            reservations, key=lambda r: r['count'], reverse=True
        )[:3]
        restaurants = [ Restaurant.objects.get(_id=sl['restaurant']) for sl in sorted_list ]
        serializer = RestaurantSerializer(restaurants, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_reservations_within_timeline (request, pk):
    try:
        restaurant = Restaurant.objects.get(_id=pk)
        sg_tz = pytz.timezone('Asia/Singapore')
        date1 = request.query_params.get('date1')
        date2 = request.query_params.get('date2')
        if date1 is None or date2 is None:
            return Response({'details' : 'Invalid or Empty Dates'}, status=status.HTTP_400_BAD_REQUEST)
        date1 = datetime.strptime(date1, '%Y-%m-%d').astimezone(sg_tz)
        date2 = datetime.strptime(date2, '%Y-%m-%d').astimezone(sg_tz)
        reservations = Reservation.objects.filter(
            restaurant=restaurant, reservedDateTime__gte=date1, reservedDateTime__lte=date2
        )
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)
    except Restaurant.DoesNotExist:
        return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
