from django.shortcuts import render
from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from base.models import Product, Order, OrderItem, ShippingAddress, User
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
        orders = Order.objects.all()
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
        elif type(request_body['taxPrice']) != float:
            return error, 'Tax Price must be a float type!'
        elif 'shippingAddress' not in request_body:
            return error, 'Delivery Address is required*'
        elif 'shippingPrice' not in request_body:
            return error, 'Shipping Price is Required*'
        elif type(request_body['taxPrice']) != float:
            return error, 'Shipping Price must be a float type!'
        elif 'totalPrice' not in request_body:
            return error, 'Total Price is Required*'
        elif type(request_body['taxPrice']) != float:
            return error, 'Total Price must be a float type!'
        elif 'isPaid' not in request_body:
            return error, 'Missing Required Field! isPaid'
        elif type(request_body['isPaid']) != bool:
            return error, 'Field, isPaid, must be a boolean type!'
        elif 'paidAt' not in request_body:
            return error, 'Missing Required Field! paidAt'
        elif 'isDelivered' not in request_body:
            return error, 'Missing Required Field! isDelivered'
        elif type(request_body['isDelivered']) != bool:
            return error, 'Field, isDelivered, must be a boolean type!'
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
            elif type(item['price']) != float:
                return error, 'Price value must be float type!'
            elif 'totalPrice' not in item:
                return error, 'Field, totalPrice, is required*'
            elif type(item['totalPrice']) != float:
                return error, 'Total Price value must be float type!'
        return False, ''


    def validate_product (self, product_id):
        product = Product.objects.filter(_id=product_id)
        return len(product)


    def create_order (self, data, user, paid_time):
        order = Order.objects.create(
            user=user,
            paymentMethod=data['paymentMethod'],
            taxPrice=data['taxPrice'],
            shippingPrice=data['shippingPrice'],
            shippingAddress=data['shippingAddress'],
            totalPrice=data['totalPrice'],
            isPaid=data['isPaid'],
            isDelivered=data['isDelivered'],
            paidAt=paid_time
        )
        serializer = OrderSerializer(order)
        return serializer.data, order


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
            paid_time = datetime.strptime (data['paidAt'], '%Y-%m-%d %H:%M:%S')
            # validate order items
            error, message = self.validate_order_items (data['orderItems'])
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            order_data, order_obj = self.create_order (data, user, paid_time)
            self.create_order_items(data['orderItems'], order_obj)
            return Response(order_data)
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


#
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def addOrderItems(request):
#     user = request.user
#     data = request.data
#
#     orderItems = data['orderItems']
#
#     if orderItems and len(orderItems) == 0:
#         return Response({'detail': 'No Order Items'}, status=status.HTTP_400_BAD_REQUEST)
#     else:
#
#         # (1) Create order
#
#         order = Order.objects.create(
#             user=user,
#             paymentMethod=data['paymentMethod'],
#             taxPrice=data['taxPrice'],
#             shippingPrice=data['shippingPrice'],
#             totalPrice=data['totalPrice']
#         )
#
#         # (2) Create shipping address
#
#         shipping = ShippingAddress.objects.create(
#             order=order,
#             address=data['shippingAddress']['address'],
#             city=data['shippingAddress']['city'],
#             postalCode=data['shippingAddress']['postalCode'],
#             country=data['shippingAddress']['country'],
#         )
#
#         # (3) Create order items adn set order to orderItem relationship
#         for i in orderItems:
#             product = Product.objects.get(_id=i['product'])
#
#             item = OrderItem.objects.create(
#                 product=product,
#                 order=order,
#                 name=product.name,
#                 qty=i['qty'],
#                 price=i['price'],
#                 image=product.image.url,
#             )
#
#             # (4) Update stock
#
#             product.countInStock -= item.qty
#             product.save()
#
#         serializer = OrderSerializer(order, many=False)
#         return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = user.order_set.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

#
# @api_view(['GET'])
# @permission_classes([IsAdminUser])
# def getOrders(request):
#     orders = Order.objects.all()
#     serializer = OrderSerializer(orders, many=True)
#     return Response(serializer.data)

#
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def getOrderById(request, pk):
#
#     user = request.user
#
#     try:
#         order = Order.objects.get(_id=pk)
#         if user.is_staff or order.user == user:
#             serializer = OrderSerializer(order, many=False)
#             return Response(serializer.data)
#         else:
#             Response({'detail': 'Not authorized to view this order'},
#                      status=status.HTTP_400_BAD_REQUEST)
#     except:
#         return Response({'detail': 'Order does not exist'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    order = Order.objects.get(_id=pk)

    order.isPaid = True
    order.paidAt = datetime.now()
    order.save()

    return Response('Order was paid')


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    order = Order.objects.get(_id=pk)

    order.isDelivered = True
    order.deliveredAt = datetime.now()
    order.save()

    return Response('Order was delivered')
