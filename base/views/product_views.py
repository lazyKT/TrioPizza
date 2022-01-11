from django.shortcuts import render
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from base.models import Product, Review, Restaurant
from base.serializers import ProductSerializer

from rest_framework import status



class ProductList (APIView):
    """
    # Get All Products
    # Create New Products
    """

    def get (self, request, format=None):
        query = request.query_params.get('keyword')
        if query is None:
            query = ''

        products = Product.objects.filter(name__icontains=query).order_by('-createdAt')
        num_products = len(products)

        page = request.query_params.get('page')
        if page is None:
            page = 1

        page = int(page)

        paginator = Paginator(products, 10)

        try:
            products = paginator.page(page)
        except PageNotAnInteger:
            products = paginator.page(1)
        except EmptyPage:
            products = paginator.page(paginator.num_pages)

        serializer = ProductSerializer(products, many=True)
        return Response({'products' : serializer.data, 'page' : page, 'pages': paginator.num_pages, 'count' : num_products})


    def validate_request (self, body):
        error = True
        message = ''
        if 'name' not in body:
            message = 'Product Name is Required*'
            return error, message
        elif 'description' not in body:
            message = 'Description is Required*'
            return error, message
        elif 'price' not in body:
            message = 'Price is Required*'
            return error, message
        elif 'restaurant' not in body:
            message = 'Restaurant is Required*'
            return error, message
        else:
            error = False
            return error, ''


    def post (self, request, *args, **kwargs):
        try:
            data = request.data
            error, message = self.validate_request (data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            restaurant = Restaurant.objects.get(_id=data['restaurant'])

            product = Product.objects.create(
                name=data['name'],
                price=data['price'],
                description=data['description'],
                restaurant=restaurant
            )

            serializer = ProductSerializer(product)
            return Response(serializer.data)

        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ProductDetails (APIView):
    """
    # GET/UPDATE product details
    # DELETE product by id
    """

    def get_object (self, pk):
        try:
            return Product.objects.get(_id=pk)
        except Product.DoesNotExist:
            raise Http404


    def get (self, request, pk, format=None):
        try:
            product = self.get_object(pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def validate_edit_request (self, body):
        error = True
        message = ''
        if 'name' not in body:
            message = 'Product Name is Required*'
            return error, message
        elif 'description' not in body:
            message = 'Description is Required*'
            return error, message
        elif 'price' not in body:
            message = 'Price is Required*'
            return error, message
        elif 'restaurant' not in body:
            message = 'Restaurant is Required*'
            return error, message
        else:
            error = False
            return error, ''


    def put (self, request, pk, format=None):
        try:
            product = self.get_object(pk)
            data =request.data
            error, message = self.validate_edit_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            restaurant = Restaurant.objects.get(_id=data['restaurant'])
            product.restaurant = restaurant
            product.name = data['name']
            product.price = data['price']
            product.description = data['description']
            product.save()
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
        except Http404:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete (self, request, pk, format=None):
        try:
            product = self.get_object(pk)
            try:
                product_review = Review.objects.get(product=product)
                product_review.delete()
            except Review.DoesNotExist:
                pass
            product.delete()
            return Response('', status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    if query == None:
        query = ''

    products = Product.objects.filter(
        name__icontains=query).order_by('-createdAt')

    page = request.query_params.get('page')
    paginator = Paginator(products, 8)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)

    if page == None:
        page = 1

    page = int(page)
    serializer = ProductSerializer(products, many=True)
    return Response({'products': serializer.data, 'page': page, 'pages': paginator.num_pages})


@api_view(['GET'])
def getTopProducts(request):
    try:
        products = Product.objects.filter(rating__gte=4).order_by('-rating')[0:5]
        if len(products) == 0:
            products = Product.objects.all()[:5]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'details' : repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def getProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'details' : 'Product Not Found'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'details' : repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
# @permission_classes([IsAdminUser])
def createProduct(request):
    try:
        data = request.data
        print(data);

        if 'name' not in data:
            return Response({'deatils' : 'Name is required*'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'price' not in data:
            return Response({'details' : 'Price is required*'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'description' not in data:
            return Response({'details' : 'Description is required*'}, status=status.HTTP_400_BAD_REQUEST)

        product = Product.objects.create(
            name=data['name'],
            price=data['price'],
            description=data['description']
        )

        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Exception as e:
        print(repr(e))
        return Response({'details' : repr(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
# @permission_classes([IsAdminUser])
def updateProduct(request, pk):
    try:
        data = request.data
        product = Product.objects.get(_id=pk)

        product.name = data['name']
        product.price = data['price']
        product.description = data['description']

        product.save()

        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'details' : 'Product Not Found!'}, status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'details' : repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
# @permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
        product.delete()
        return Response('Producted Deleted')
    except Product.DoesNotExist:
        return Response({'details' : 'Product Not Found!'}, status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'details' : repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def uploadImage(request):
    try:
        data = request.data
        id = data['product_id']
        product = Product.objects.get(_id=id)

        product.image = request.FILES.get('image')
        product.save()

        return Response({'details' : 'Image Uploaded Successfully!'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'details' : 'Product Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'details' : repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(_id=pk)
    data = request.data

    # 1 - Review already exists
    alreadyExists = product.review_set.filter(user=user).exists()
    if alreadyExists:
        content = {'detail': 'Product already reviewed'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)

    # 2 - No Rating or 0
    elif data['rating'] == 0:
        content = {'detail': 'Please select a rating'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)

    # 3 - Create review
    else:
        review = Review.objects.create(
            user=user,
            product=product,
            name=user.first_name,
            rating=data['rating'],
            comment=data['comment'],
        )

        reviews = product.review_set.all()
        product.numReviews = len(reviews)

        total = 0
        for i in reviews:
            total += i.rating

        product.rating = total / len(reviews)
        product.save()

        return Response('Review Added')
