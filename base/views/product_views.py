from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from base.models import Product, Review
from base.serializers import ProductSerializer

from rest_framework import status


@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    if query == None:
        query = ''

    products = Product.objects.filter(
        name__icontains=query).order_by('-createdAt')

    page = request.query_params.get('page')
    paginator = Paginator(products, 5)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)

    if page == None:
        page = 1

    page = int(page)
    print('Page:', page)
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
@permission_classes([IsAdminUser])
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
