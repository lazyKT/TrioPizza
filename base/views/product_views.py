from django.shortcuts import render
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from base.models import Product, Review, Restaurant, FeatureProduct
from base.serializers import ProductSerializer, FeatureProductSerializer

from rest_framework import status



class ProductList (APIView):
    """
    # Get All Products
    # Create New Products
    """

    def get (self, request, format=None):
        try:
            query = request.query_params.get('keyword')
            if query is None:
                query = ''

            products = None
            restaurant_id = request.query_params.get('restaurant')
            if restaurant_id is None:
                products = Product.objects.filter(name__icontains=query).order_by('-createdAt')
            else:
                restaurant = Restaurant.objects.get(_id=restaurant_id)
                products = Product.objects.filter(restaurant=restaurant).filter(name__icontains=query).order_by('name')

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
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            if len(FeatureProduct.objects.filter(product=product)) > 0:
                return Response({'details' : 'Cannot delete Fature Product!'}, status=status.HTTP_400_BAD_REQUEST)

            product.delete()
            return Response('', status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_products_by_restaurant (request, restaurant_id):
    try:
        restaurant = Restaurant.objects.get(_id=restaurant_id)
        products = Product.objects.filter(restaurant=restaurant)
        num_products = len(products)

        page = request.query_params.get('page')
        if page is None:
            page = 1
        page = int(page)

        paginator = Paginator(products, 8)

        try:
            products = paginator.page(page)
        except PageNotAnInteger:
            products = paginator.page(1)
        except EmptyPage:
            products = paginator.page(paginator.num_pages)

        serializer = ProductSerializer(products, many=True)
        return Response({'products' : serializer.data, 'page' : page, 'pages': paginator.num_pages, 'count' : num_products})
    except Restaurant.DoesNotExist:
        return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error = 'Internal Server Error' if str(e) == '' else str(e)
        return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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



"""
# Feature Products
"""

class FeatureProductList (APIView):
    """
    # GET All Feature Products
    # Create New Feature Products
    """

    def get_feature_product_by_product_id (self, product):
        return FeatureProduct.objects.filter(product=product)


    def get_feature_products_by_restaurant (self, restaurant):
        return FeatureProduct.objects.filter(restaurant=restaurant)


    def get (self, request, format=None):
        try:
            query = request.query_params.get('restaurant')
            products = None
            if query is None:
                products = FeatureProduct.objects.all()
            else:
                restaurant = Restaurant.objects.get(_id=query)
                products = FeatureProduct.objects.filter(restaurant=restaurant)
            serializer = FeatureProductSerializer(products, many=True)
            return Response(serializer.data)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Does Not Exist!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def validate_request (self, body):
        error = True
        message = ''
        if 'product' not in body:
            message = 'Product is Required*'
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
            error, message = self.validate_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)

            product = Product.objects.get(_id=data['product'])
            if len(self.get_feature_product_by_product_id(product)) > 0:
                return Response({'details' : 'Given Product is already listed as Feature Product!'}, status=status.HTTP_400_BAD_REQUEST)

            restaurant = Restaurant.objects.get(_id=data['restaurant'])

            if restaurant._id != product.restaurant._id:
                return Response({'details' : 'Invalid Restaurant!'}, status=status.HTTP_400_BAD_REQUEST)

            if len(self.get_feature_products_by_restaurant(restaurant)) >= 5:
                return Response({'details' : 'You can only list five feature products!'}, status=status.HTTP_400_BAD_REQUEST)

            feature_product = FeatureProduct.objects.create(
                restaurant=restaurant,
                product=product
            )
            serializer = FeatureProductSerializer(feature_product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'details' : 'Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Restaurant.DoesNotExist:
            return Response({'details' : 'Restaurant Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FeatureProductDetails (APIView):
    """
    # Get Feature Product Details
    # Delete Feature Product by Id
    """

    def get_object (self, pk):
        try:
            return FeatureProduct.objects.get(_id=pk)
        except FeatureProduct.DoesNotExist:
            raise Http404


    def get (self, request, pk, format=None):
        try:
            feature_product = self.get_object(pk)
            serializer = FeatureProductSerializer(feature_product)
            return Response(serializer.data)
        except Http404:
            return Response({'details' : 'Feature Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete (self, request, pk, format=None):
        try:
            feature_product = self.get_object(pk)
            feature_product.delete()
            return Response('', status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response({'details' : 'Feature Product Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error = 'Internal Server Error' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
