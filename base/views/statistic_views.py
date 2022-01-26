"""
# Views for Static Data
# eg. total orders per restaurant, weekly order,
# number of orders from districts
"""

from django.http import Http404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User

from base.models import Restaurant, Order, Location



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
