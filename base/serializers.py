import pytz
from datetime import datetime
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Profile,
    Product,
    Order,
    OrderItem,
    ShippingAddress,
    Review,
    Promos,
    DriverOrderStatus,
    Reservation,
    PreOrder,
    Restaurant,
    RestaurantReview,
    Location,
    FeatureProduct
)


class UserSerializer (serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)
    mobile = serializers.SerializerMethodField(read_only=True)
    type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'mobile', 'name', 'isAdmin', 'type']

    def get_isAdmin(self, obj):
        return 'Yes' if obj.is_staff else 'No'

    def get_name (self, obj):
        return obj.profile.name

    def get_mobile (self, obj):
        return obj.profile.mobile

    def get_type (self, obj):
        return obj.profile.type


class UserSerializerWithToken (UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'isAdmin', 'type', 'token', 'mobile']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)


class ProfileSerializer (serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)
    id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'mobile', 'name', 'type']

    def get_username (self, obj):
        user = obj.user
        return user.username

    def get_id (self, obj):
        user = obj.user
        return user.id



class ReviewSerializer (serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class ProductSerializer (serializers.ModelSerializer):
    reviews = serializers.SerializerMethodField(read_only=True)
    feature = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = ['name', 'description', 'restaurant', 'reviews', 'image', 'price', 'createdAt', '_id', 'feature']

    def get_reviews(self, obj):
        reviews = obj.review_set.all()
        serializer = ReviewSerializer(reviews, many=True)
        return serializer.data

    def get_feature (self, obj):
        feature = obj.featureproduct_set.all()
        if len(feature) > 0:
            return True
        return False



class ShippingAddressSerializer (serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'


class OrderItemSerializer (serializers.ModelSerializer):
    product = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

    def get_product(self, obj):
        product = obj.product
        serializer = ProductSerializer(product)
        return serializer.data


class OrderSerializer (serializers.ModelSerializer):
    orderItems = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    driver = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_orderItems(self, obj):
        items = obj.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data

    def get_user(self, obj):
        user = obj.user
        if user is None:
            return None
        serializer = UserSerializer(user, many=False)
        return serializer.data

    def get_driver (self, obj):
        driver = obj.deliveredBy
        if driver is None:
            return None
        serializer = UserSerializer(driver, many=False)
        return serializer.data


class DriverOrderStatusSerializer (serializers.ModelSerializer):
    driver = serializers.SerializerMethodField(read_only=True)
    name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DriverOrderStatus
        fields = ['_id', 'driver', 'name', 'active_orders', 'total_order', 'status', 'last_assigned']

    def get_driver (self, obj):
        driver = obj.driver
        if driver is None:
            return None
        serializer = UserSerializer(driver)
        return serializer.data

    def get_name (self, obj):
        driver = obj.driver
        if driver is None:
            return 'Deleted!'
        return driver.profile.name


class ReservationSerializer (serializers.ModelSerializer):
    customer = serializers.SerializerMethodField(read_only=True)
    reservedDateTime = serializers.SerializerMethodField(read_only=True)
    preOrderItems = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Reservation
        fields = ['_id', 'customer', 'num_of_pax', 'status', 'reservedDateTime', 'created_at', 'preOrderItems']

    def get_customer (self, obj):
        customer = obj.user
        serializer = UserSerializer(customer)
        return serializer.data

    def get_reservedDateTime (self, obj):
        reservedDateTime = obj.reservedDateTime
        return datetime.strftime(reservedDateTime, '%Y-%m-%d %I:%M %p')

    def get_preOrderItems (self, obj):
        items = obj.preorder_set.all()
        serializer = PreOrderSerializer(items, many=True)
        return serializer.data


class PreOrderSerializer (serializers.ModelSerializer):
    product = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PreOrder
        fields = '__all__'

    def get_product (self, obj):
        product = obj.product
        serializer = ProductSerializer(product)
        return serializer.data


class LocationSerializer (serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = '__all__'


class RestaurantSerializer (serializers.ModelSerializer):
    locations = serializers.SerializerMethodField(read_only=True)
    owner_name = serializers.SerializerMethodField(read_only=True)
    reviews = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Restaurant
        fields = ['_id', 'owner', 'name', 'owner_name', 'reviews', 'description', 'locations', 'logo', 'created_at']

    def get_locations (self, obj):
        locations = obj.location_set.all()
        serializer = LocationSerializer(locations, many=True)
        return serializer.data

    def get_owner_name (self, obj):
        owner = obj.owner
        if owner is None:
            return ""
        return owner.profile.name

    def get_reviews (self, obj):
        reviews = obj.restaurantreview_set.all()
        serializer = RestaurantReviewSerializer(reviews, many=True)
        return serializer.data


class FeatureProductSerializer (serializers.ModelSerializer):
    product = serializers.SerializerMethodField(read_only=True)
    restaurant = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FeatureProduct
        fields = '__all__'

    def get_product (self, obj):
        product = obj.product
        serializer = ProductSerializer(product)
        return serializer.data

    def get_restaurant (self, obj):
        restaurant = obj.restaurant
        serializer = RestaurantSerializer(restaurant)
        return serializer.data


class PromosSerializer (serializers.ModelSerializer):
    # product = serializers.SerializerMethodField(read_only=True)
    # restaurant = serializers.SerializerMethodField(read_only=True)
    status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Promos
        fields = '__all__'

    def get_status (self, obj):
        expiry_dt = obj.expiry_date
        return 'active' if expiry_dt > pytz.utc.localize(datetime.now()) else 'expired'


class RestaurantReviewSerializer (serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RestaurantReview
        fields = '__all__'

    def get_user (self, obj):
        user = obj.user
        if user is None:
            return None
        return user.profile.name
