import pytz
from datetime import datetime
from django.http import Http404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from base.models import User, Reservation, Product
from base.serializers import ReservationSerializer



class ReservationList (APIView):
    """
    # Get List of Reservations
    # Create new Reservations
    """

    def get (self, request, format=None):
        """
        # Get Reservation Lists
        """
        reservations = Reservation.objects.all().order_by('-_id')
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)


    def get_user_by_id (self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise Http404


    def validate_request_body (self, data):
        error = True
        if 'user' not in data:
            return error, 'User Must Not Be Empty*'
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

            reservedDateTime = datetime.strptime(data['reservedDateTime'], '%Y-%m-%d %H:%M')
            reservation = Reservation.objects.create(
                user=user,
                num_of_pax=data['num_of_pax'],
                reservedDateTime=pytz.utc.localize(reservedDateTime) # add timezone to create timezone aware datetime object
            )
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
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
                reservedDateTime = datetime.strptime(data['reservedDateTime'], '%Y-%m-%d %H:%M')
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
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
