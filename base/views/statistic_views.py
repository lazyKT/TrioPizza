"""
# Views for Static Data
# eg. total orders per restaurant, weekly order,
# number of orders from districts
"""

import pytz
from datetime import datetime
from django.http import Http404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count, DateField, Sum
from django.db.models.functions import TruncYear, TruncMonth, TruncWeek, TruncDate

from base.models import Restaurant, Product, Order, OrderItem, Reservation, Location, DriverOrderStatus



class RestaurantStatisticView (APIView):
    """
    # Get Informatin about Statistic Views of restaurants and orders
    """

    def get_all_restaurants (self):
        return Restaurant.objects.all()

    def get (self, request, format=None):
        try:
            filter = request.query_params.get('filter')
            restaurant_orders = dict()
            if filter is None:
                restaurants = self.get_all_restaurants()
                for restaurant in restaurants:
                    restaurant_orders[restaurant.name] = len(Order.objects.filter(restaurant=restaurant))

            return Response(restaurant_orders)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class RestaurantResgiterationView (APIView):
    """
    # Get Restaurant Registeration Info
    """

    def get_first_day_of_month (self):
        today = datetime.today().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return pytz.utc.localize(today)


    def get_all_restaurants_count (self):
        return Restaurant.objects.all().count()


    def get (self, request, format=None):
        try:
            first_day = self.get_first_day_of_month()
            newly_registered_restaurants = Restaurant.objects.filter(
                created_at__gte=first_day
            ).count()
            return Response({
                'all_restaurants' : self.get_all_restaurants_count(),
                'new_registered' : newly_registered_restaurants
            })
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RestaurantOrderReservationStatictisView (APIView):
    """
    # Monthly, Weekly, Daily Order Data for restaurants
    """

    def get_restaurant (self, pk):
        try:
            return Restaurant.objects.get(_id=pk)
        except Restaurant.DoesNotExist:
            raise Http404


    def get (self, request, pk, format=None):
        try:
            restaurant = self.get_restaurant(pk)
            stats = list()
            filter = request.query_params.get('filter')
            data = request.query_params.get('data')
            if data != 'orders' and data != 'reservations':
                return Response({'details' : 'Invalid Request!'}, status=status.HTTP_400_BAD_REQUEST)
            # daily
            if filter == 'day':
                if data == 'orders':
                    stats = Order.objects.filter(restaurant=restaurant).annotate(
                        day=TruncDate('createdAt', output_field=DateField()),
                    ).values('day').annotate(count=Count('createdAt'))
                else:
                    stats = Reservation.objects.filter(restaurant=restaurant).annotate(
                        day=TruncDate('created_at', output_field=DateField()),
                    ).values('day').annotate(count=Count('created_at'))

            # weekly
            elif filter == 'week':
                if data == 'orders':
                    stats = Order.objects.filter(restaurant=restaurant).annotate(
                        week=TruncWeek('createdAt', output_field=DateField()),
                    ).values('week').annotate(count=Count('createdAt'))
                else:
                    stats = Reservation.objects.filter(restaurant=restaurant).annotate(
                        week=TruncWeek('created_at', output_field=DateField()),
                    ).values('week').annotate(count=Count('created_at'))

            # montly
            elif filter == 'month':
                if data == 'orders':
                    stats = Order.objects.filter(restaurant=restaurant).annotate(
                        month=TruncMonth('createdAt', output_field=DateField()),
                    ).values('month').annotate(count=Count('createdAt'))
                else:
                    stats = Reservation.objects.filter(restaurant=restaurant).annotate(
                        month=TruncMonth('created_at', output_field=DateField()),
                    ).values('month').annotate(count=Count('created_at'))

            return Response(stats)
        except Http404:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RestaurantsProductsView (APIView):
    """
    # Get sales data of products from a restaurant
    """

    def get_first_day_of_month (self):
        today = datetime.today().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return pytz.utc.localize(today)


    def get_restaurant (self, pk):
        try:
            return Restaurant.objects.get(_id=pk)
        except Restaurant.DoesNotExist:
            raise Http404


    def get_restaurant_products (self, restaurant):
        return Product.objects.filter(restaurant=restaurant);


    def get (self, request, pk, format=None):
        try:
            filter = request.query_params.get('filter')
            # first_day = self.get_first_day_of_month()
            restaurant = self.get_restaurant(pk)
            restaurant_products = self.get_restaurant_products(restaurant)
            product_sales = list()
            for product in restaurant_products:
                data = OrderItem.objects.filter(product=product).aggregate(Sum('totalPrice'))
                data['product'] = product.name
                product_sales.append(data)
            sorted_product_sales = sorted(
                product_sales, key=lambda d: d['totalPrice__sum'] if d['totalPrice__sum'] is not None else 0, reverse=True
            )
            total_earnings = sum(
                sale['totalPrice__sum'] if sale['totalPrice__sum'] is not None else 0 for sale in sorted_product_sales
            )
            return Response({
                'sales' : sorted_product_sales,
                'total_earnings' : total_earnings
            })
        except Http404:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DistrictStatisticView (APIView):
    """
    # Get Order Statistic from Districts
    """

    def get_all_restaurants (self):
        return Restaurant.objects.all()

    def get_restaurant_district (self, restaurant):
        try:
            return (Location.objects.get(restaurant=restaurant)).district
        except:
            raise Http404

    def get (self, request, format=None):
        try:
            filter = request.query_params.get('filter')
            district_orders = dict()
            if filter is None:
                restaurants = self.get_all_restaurants()
                for restaurant in restaurants:
                    district = self.get_restaurant_district(restaurant)
                    if district in district_orders:
                        district_orders[district] += len(Order.objects.filter(restaurant=restaurant))
                    else:
                        district_orders[district] = len(Order.objects.filter(restaurant=restaurant))
            return Response(district_orders)
        except Http404:
            return Response({'details' : 'Restaurant Location Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DriverOrderDeliveries (APIView):
    """
    # Get Total Number of Orders and Deliveries for each driver
    """

    def get_all_drivers (self):
        sts = DriverOrderStatus.objects.all()
        return [ s.driver for s in sts ]


    def get (self, request, format=None):
        try:
            orders_deliveries = list()
            drivers = self.get_all_drivers()
            for driver in drivers:
                total_orders = Order.objects.filter(deliveredBy=driver).count()
                total_deliveries = Order.objects.filter(deliveredBy=driver).filter(status='delivered').count()
                orders_deliveries.append({
                    'name' : driver.profile.name,
                    'id' : driver.id,
                    'orders' : total_orders,
                    'deliveries' : total_deliveries
                })
            return Response(orders_deliveries)
        except Exception as e:
            error = 'Internal Server Error!' if repr(e) == '' else repr(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_driver_order_deliveries (request):
    orders = Order.objects.filter(
        status='delivered'
    ).values('deliveredBy').annotate(count=Count('deliveredBy'))
    return Response(orders)
