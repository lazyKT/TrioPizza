from django.shortcuts import render
from django.http import Http404
from django.db.models import Count
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from base.models import Product, Order, OrderItem, ShippingAddress, User, DriverOrderStatus, Restaurant
from base.serializers import ProductSerializer, OrderSerializer
from base.utils import send_email, get_email_template
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
        try:
            orders = None
            restaurant_id = request.query_params.get('restaurant')
            if restaurant_id is None:
                orders = Order.objects.all().order_by('-status', '-_id')
            else:
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                orders = Order.objects.filter(restaurant=restaurant).order_by('-status', '-_id')

            num_orders = len(orders)

            page = request.query_params.get('page')
            if page is None:
                page = 1

            page = int(page)

            paginator = Paginator(orders, 5)

            try:
                orders = paginator.page(page)
            except PageNotAnInteger:
                orders = paginator.page(1)
            except EmptyPage:
                orders = paginator.page(paginator.num_pages)

            serializer = OrderSerializer(orders, many=True)
            return Response ({'orders' : serializer.data, 'page': page, 'pages' : paginator.num_pages, 'count' : num_orders });
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Sever Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def validate_cretae_order_request (self, request_body):
        error = True
        if 'user' not in request_body:
            return error, 'Mising Required Field! User'
        if 'restaurant' not in request_body:
            return error, 'Missing Required Field! Restaurant'
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


    def create_order (self, data, customer, driver, restaurant):
        return Order.objects.create(
            user=customer,
            restaurant=restaurant,
            paymentMethod=data['paymentMethod'],
            taxPrice=data['taxPrice'],
            shippingPrice=data['shippingPrice'],
            shippingAddress=data['shippingAddress'],
            totalPrice=data['totalPrice'],
            isPaid=data['isPaid'],
            isDelivered=False,
            deliveredBy=driver,
            paidAt=datetime.now() if data['isPaid'] else None,
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


    def get_driver (self):
        """
        # get available driver to automatically assign to the order using Round Robin Mechanism
        """
        # Get the id of last assigned driver
        available_drivers = DriverOrderStatus.objects.filter(status='available')
        if len(available_drivers) == 0:
            return None

        last_assigned_driver = DriverOrderStatus.objects.filter(last_assigned=True)

        # If none of the driver is assigned, the driver with least id will get the order
        if len(last_assigned_driver) > 0:
            last_assigned_driver = last_assigned_driver[0]
            last_assigned_driver.last_assigned = False
            last_assigned_driver.save()
            next_drivers = DriverOrderStatus.objects.filter(_id__gt=last_assigned_driver._id).filter(status='available')
            if len(next_drivers) > 0:
                return next_drivers[0].driver

        # Otherwise, the driver with next id (id of last assigned driver + 1) will get the order
        # if the computed next id (id of last assigned driver + 1) is invalid, the driver with least id will get the order
        return available_drivers[0].driver


    @staticmethod
    def update_driver_order_status (driver, order):
        """
        # Update the driver orders & status upon assigning new orders
        """
        try:
            current_status = DriverOrderStatus.objects.get(driver=driver)
            current_status.current_order = order
            current_status.active_orders = current_status.active_orders + 1
            if current_status.active_orders > 4:
                current_status.status = 'full'
            current_status.total_order = current_status.total_order + 1
            current_status.last_assigned = True
            current_status.save()
        except DriverOrderStatus.DoesNotExist:
            raise Http404


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
            # Get Available Driver to Assign
            driver = self.get_driver()
            if driver is None:
                # if there are no aviable drivers
                return Response({'details' : 'Our Drivers Are Busy. Please Try Again Later'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            restaurant = Restaurant.objects.get(_id=data['restaurant'])
            # restaurant owner
            restaurant_owner = User.objects.get(id=restaurant.owner.id)
            # Create Order
            order = self.create_order (data, user, driver, restaurant)
            # Update Driver Status
            OrderList.update_driver_order_status (driver, order)
            # Save Order Items Detail
            self.create_order_items(data['orderItems'], order)
            # Email
            driver_email_template = get_email_template('order_cfm_driver')
            owner_email_template = get_email_template('order_cfm_restaurant')
            cust_email_template = get_email_template('order_cfm_customer')
            order_date_time = datetime.strftime(order.createdAt, '%Y-%m-%d %I:%M %p')
            order_items = list()
            for item in data['orderItems']:
                order_items.append({ "name" : item['name'], "qty" : f"x{item['qty']}"})

            email_data = {
                "restaurant_name" : restaurant.name,
                "address" : data['shippingAddress'],
                "orders" : {
                    "date_time" : order_date_time,
                    "items" : order_items
                }
            }
            send_email([driver.username], driver_email_template, email_data) # send email to driver
            send_email([restaurant_owner.username], owner_email_template, email_data) # send email to restaurant owner
            send_email([user.username], cust_email_template, email_data) # send email to customer

            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'User Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Sever Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class OrderDetails (APIView):
    """
    # GET Order Details by Id
    # Edit/Update Orders by Id
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
        orders = Order.objects.filter(user=user).order_by('-status', '-_id')

        page = request.query_params.get('page')
        if page is None:
            page = 1

        page = int(page)

        paginator = Paginator(orders, 5)

        try:
            orders = paginator.page(page)
        except PageNotAnInteger:
            orders = paginator.page(1)
        except EmptyPage:
            orders = paginator.page(paginator.num_pages)

        serializer = OrderSerializer(orders, many=True)
        return Response({'orders' : serializer.data, 'page' : page, 'pages' : paginator.num_pages})
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
        orders = Order.objects.filter(deliveredBy=driver).order_by('-status', '-_id')

        total_orders = len(orders)

        page = request.query_params.get('page')
        if page is None:
            page = 1

        page = int(page)

        paginator = Paginator(orders, 5)

        try:
            orders = paginator.page(page)
        except PageNotAnInteger:
            orders = paginator.page(1)
        except EmptyPage:
            orders = paginator.page(paginator.num_pages)

        serializer = OrderSerializer(orders, many=True)
        return Response({'deliveries' : serializer.data, 'page' : page, 'pages' : paginator.num_pages, 'total' : total_orders})
    except User.DoesNotExist:
        return Response({'details' : 'Driver Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_driver_order_stats (request, pk):
    try:
        driver = User.objects.get(id=pk)
        if driver.profile.type != 'driver':
            return Response({'details' : 'Invalid Driver!'}, status=status.HTTP_400_BAD_REQUEST)
        orders_stats = { 'cancelled' : 0, 'delivered' : 0, 'progress' : 0}
        orders = Order.objects.filter(deliveredBy=driver).values('status').annotate(
            count=Count('status')
        )
        for order in orders:
            if order['status'] == 'cancelled':
                orders_stats['cancelled'] += order['count']
            elif order['status'] == 'delivered':
                orders_stats['delivered'] += order['count']
            elif order['status'] == 'progress':
                orders_stats['progress'] += order['count']

        total_orders = Order.objects.filter(deliveredBy=driver).count()

        return Response({
            'orders_stats': orders_stats,
            'total_orders' : total_orders
        })

    except User.DoesNotExist:
        return Response({'details' : 'Driver Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def update_driver_order_status (driver):
    """
    # Update the driver orders & status upon assigning new orders
    """
    try:
        current_status = DriverOrderStatus.objects.get(driver=driver)
        current_status.status = 'available'
        current_status.active_orders = current_status.active_orders - 1
        current_status.save()
    except DriverOrderStatus.DoesNotExist:
        raise Http404


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
        if order.isPaid == False:
            order.isPaid = True
            order.paidAt = datetime.now()
        order.save()
        update_driver_order_status (order.deliveredBy)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
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
        serializer = OrderSerializer(order)
        update_driver_order_status (order.deliveredBy)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'details' : 'Order Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error!' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
