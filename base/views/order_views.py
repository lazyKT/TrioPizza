from django.shortcuts import render
from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from base.models import Product, Order, OrderItem, ShippingAddress, User, DriverOrderStatus
from base.serializers import ProductSerializer, OrderSerializer

from rest_framework import status
from datetime import datetime




# GET all orders or create new order
class OrderList (APIView):
    """
    # GET all orders or create new order
    """

    def get (self, request, format=None):
        """
        # GET all orders
        """
        orders = Order.objects.all().order_by('-_id')
        serializer = OrderSerializer(orders, many=True)
        return Response (serializer.data)


    def validate_cretae_order_request (self, request_body):
        error = True
        if 'user' not in request_body:
            return error, 'Mising Required Field! User'
        elif 'orderItems' not in request_body:
            return error, 'Field, orderItems, is required!'
        elif len(request_body['orderItems']) == 0:
            return error, 'No item(s) in the cart!'
        elif 'paymentMethod' not in request_body:
            return error, 'Payment Method is Required*'
        elif 'taxPrice' not in request_body:
            return error, 'Tax Price is Required*'
        elif type(request_body['taxPrice']) != float and type(request_body['taxPrice']) != int:
            return error, 'Tax Price must be a number type!'
        elif 'shippingAddress' not in request_body:
            return error, 'Delivery Address is required*'
        elif 'shippingPrice' not in request_body:
            return error, 'Shipping Price is Required*'
        elif type(request_body['taxPrice']) != float and type(request_body['shippingPrice']) != int:
            return error, 'Shipping Price must be a number type!'
        elif 'totalPrice' not in request_body:
            return error, 'Total Price is Required*'
        elif type(request_body['totalPrice']) != float and type(request_body['totalPrice']) != int:
            return error, 'Total Price must be a number type!'
        elif 'isPaid' not in request_body:
            return error, 'Missing Required Field! isPaid'
        elif type(request_body['isPaid']) != bool:
            return error, 'Field, isPaid, must be a boolean type!'
        else:
            error = False
            return error, ""


    def check_user (self, user_id):
        """
        # Check if the user given is a valid user
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise Http404


    def validate_order_items (self, items):
        error = True
        for item in items:
            if 'product' not in item:
                return error, 'Field, product, is required*'
            elif self.validate_product(item['product']) < 1:
                return error, 'Product Not Found with id %s' % item['product']
            elif 'name' not in item:
                return error, 'Product Name must be specified*'
            elif 'qty' not in item:
                return error, 'Field, qty, is required*'
            elif type(item['qty']) != int:
                return error, 'Quantity value must be an Integer'
            elif 'price' not in item:
                return error, 'Field, price, is required*'
            elif type(item['price']) != float and type(item['price']) != int:
                return error, 'Price value must be number type!'
            elif 'totalPrice' not in item:
                return error, 'Field, totalPrice, is required*'
            elif type(item['totalPrice']) != float and type(item['totalPrice']) != int:
                return error, 'Total Price value must be float type!'
        return False, ''


    def validate_product (self, product_id):
        product = Product.objects.filter(_id=product_id)
        return len(product)


    def create_order (self, data, customer):
        return Order.objects.create(
            user=customer,
            paymentMethod=data['paymentMethod'],
            taxPrice=data['taxPrice'],
            shippingPrice=data['shippingPrice'],
            shippingAddress=data['shippingAddress'],
            totalPrice=data['totalPrice'],
            isPaid=data['isPaid'],
            isDelivered=False,
            paidAt=datetime.now(),
            status='progress'
        )


    def create_order_items (self, items, order):
        """
        # Create order items according to the order
        """
        try:
            for item in items:
                product = Product.objects.get(_id=item['product'])
                orderItem = OrderItem.objects.create(
                    product=product,
                    qty=item['qty'],
                    name=item['name'],
                    order=order,
                    price=item['price'],
                    totalPrice=item['totalPrice']
                )
        except Product.DoesNotExist:
            raise Exception('Product Not Found!')


    def post (self, request, format=None):
        """
        # CREATE new order
        """
        try:
            data = request.data
            # validate order request body
            error, message = self.validate_cretae_order_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            user = self.check_user(data['user'])
            # validate order items
            error, message = self.validate_order_items (data['orderItems'])
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            order = self.create_order (data, user)
            self.create_order_items(data['orderItems'], order)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Sever Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class OrderDetails (APIView):
    """
    # GET Order Details by Id
    # Edit/Update Orders by Id
    # Delete Orders by Id
    """

    def get_object (self, pk):
        try:
            return Order.objects.get(_id=pk)
        except Order.DoesNotExist:
            raise Http404

    def get (self, request, pk, format=None):
        order = self.get_object(pk)
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def put (self, request, pk, format=None):
        try:
            order = self.get_object(pk)
            return 'Good to go'
        except Exception as e:
            error = 'Internal Sever Error!' if str(e) == '' else str(e)
            return Response({'details' : str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user_orders (request, pk):
    try:
        user = User.objects.get(id=pk)
        if user.profile.type != 'customer':
            return Response({'details' : 'Invalid Customer!'}, status=status.HTTP_400_BAD_REQUEST)
        orders = Order.objects.filter(user=user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_orders_by_driver (request, pk):
    try:
        driver = User.objects.get(id=pk)
        if driver.profile.type != 'driver':
            return Response({'details' : 'Invalid User!'}, status=status.HTTP_400_BAD_REQUEST)
        orders = Order.objects.filter(deliveredBy=driver)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'details' : 'Driver Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def update_driver_order_status (driver, order):
    """
    # Update the driver orders & status upon assigning new orders
    """
    try:
        current_status = DriverOrderStatus.objects.get(driver=driver)
        current_status.current_order = order
        current_status.status = 'occupied'
        current_status.total_order = current_status.total_order + 1
        current_status.save()
    except DriverOrderStatus.DoesNotExist:
        raise Http404


def driver_complete_delivery (driver):
    """
    # Driver Finished Delivering Products and Update driver status to 'Available'
    """
    try:
        current_status = DriverOrderStatus.objects.get(driver=driver)
        current_status.status = 'available'
        current_status.current_order = None
        current_status.save()
    except DriverOrderStatus.DoesNotExist:
        raise Http404


# Assign Driver to Orders for delivery
@api_view(['PUT'])
def assign_driver_to_order (request):
    try:
        data = request.data
        print(data)
        if 'order' not in data or 'driver' not in data:
            return Response({'detailss' : 'Missing Required Fields'}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.get(_id=data['order'])
        user = User.objects.get(id=data['driver'])
        if user.profile.type != 'driver':
            return Response({'details' : 'Invalid Driver!'}, status=status.HTTP_400_BAD_REQUEST)
        order.deliveredBy = user
        order.save()
        update_driver_order_status(user, order)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'details' : 'Order Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['PUT'])
# @permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    try:
        order = Order.objects.get(_id=pk)
        order.isPaid = True
        order.status = 'completed'
        order.paidAt = datetime.now()
        order.save()
        return Response('Order was paid')
    except Order.DoesNotExist:
        return Response({'details' : 'Order Not Found'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
# @permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    try:
        order = Order.objects.get(_id=pk)
        order.isDelivered = True
        order.status = 'delivered'
        order.deliveredAt = datetime.now()
        order.save()
        driver_complete_delivery (order.deliveredBy)
        return Response('Order was delivered')
    except Order.DoesNotExist:
        return Response({'details' : 'Order Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'details' : 'Dirver Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def cancel_order (request, pk):
    try:
        order = Order.objects.get(_id=pk)
        order.status = 'cancelled'
        order.save()
        return Response('Order is cancelled!')
    except Order.DoesNotExist:
        return Response({'details' : 'Order Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
