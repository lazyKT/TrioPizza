from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

class Profile (models.Model):
    """
    # This profile model will be extended from the django default user model
    """
    user = models.OneToOneField (User, primary_key=True, on_delete=models.CASCADE)
    type = models.CharField (max_length=30, blank=True)
    name = models.CharField (max_length=64, blank=True)
    mobile = models.CharField (max_length=8, blank=True)


"""
# Whenever the new user is created, the user profile will also be created via signals
"""
@receiver (post_save, sender=User)
def create_user_profile (sender, instance, created, **kwargs):
    if created:
        Profile.objects.create (user=instance)



class Restaurant (models.Model):
    """
    # Restaurant Model
    """
    _id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=128, default='my_restaurant')
    description = models.TextField(null=True, blank=True)
    logo = models.ImageField(null=True, blank=True, default='/sample.jpg')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class Location (models.Model):
    """
    # Restaurant Addresses
    """
    _id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    address = models.TextField(null=False, blank=False)
    district = models.CharField(max_length=32, null=False, blank=False)
    postal_code = models.CharField(max_length=8, null=False, blank=False)
    contact_number = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)



class RestaurantReview (models.Model):
    """
    # Restaurant Reviews
    """
    _id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)



class Product(models.Model):
    name = models.CharField(max_length=200, blank=True, default='Pizza Name')
    description = models.TextField(null=True, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True)
    rating = models.DecimalField(
        max_digits=7, decimal_places=2, null=True, blank=True)
    numReviews = models.IntegerField(null=True, blank=True, default=0)
    image = models.ImageField(null=True, blank=True, default='/p6.jpg')
    price = models.DecimalField(
        max_digits=7, decimal_places=2, blank=True, default=0.00)
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return self.name



class FeatureProduct (models.Model):
    _id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    create_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)



class Promos (models.Model):
    """
    # Restaurant Promos
    """
    _id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.CASCADE)
    description = models.TextField()
    type = models.CharField(max_length=16, null=False, blank=False)
    amount = models.DecimalField(max_digits=6, decimal_places=2, null=False, blank=False)
    expiry_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)



class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True, default=0)
    comment = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.rating)


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='customer')
    deliveredBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='driver')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    paymentMethod = models.CharField(max_length=200, null=True, blank=True)
    taxPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    shippingAddress = models.TextField(null=True, blank=True)
    shippingPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    totalPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    isPaid = models.BooleanField(default=False)
    paidAt = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    isDelivered = models.BooleanField(default=False)
    deliveredAt = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    status = models.CharField(max_length=10)
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.createdAt)


class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    qty = models.IntegerField(null=True, blank=True, default=0)
    price = models.DecimalField(
        max_digits=7, decimal_places=2, null=True, blank=True)
    remark = models.CharField(max_length=523, null=True, blank=True, default='')
    totalPrice = models.DecimalField(decimal_places=2, max_digits=10)
    image = models.CharField(max_length=200, null=True, blank=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.name)


"""
# Saved Addresss
"""
class ShippingAddress(models.Model):
    name = models.CharField(max_length=64)
    address = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=200, null=True, blank=True)
    postalCode = models.CharField(max_length=200, null=True, blank=True)
    country = models.CharField(max_length=200, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.address)


class DriverOrderStatus (models.Model):
    _id = models.AutoField(primary_key=True)
    driver = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    status = models.CharField(max_length=10, default='available')
    last_assigned = models.BooleanField(default=False)
    total_order = models.IntegerField(default=0)
    active_orders = models.IntegerField(default=0)
    total_delivery = models.IntegerField(default=0)

    def __str__(self):
        return 'driver name: %s, status: %s' % (self.driver.profile.name, self.status)


class Reservation (models.Model):
    _id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    num_of_pax = models.IntegerField()
    status = models.CharField(max_length=16, default='active')
    pre_order = models.BooleanField(default=False)
    reservedDateTime = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)


class PreOrder (models.Model):
    _id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    qty = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)


class Support (models.Model):
    _id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=64)
    type = models.CharField(max_length=16)
    headline = models.TextField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class TempURL (models.Model):
    _id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=24)
    token = models.CharField(max_length=512)
    expire_time = models.DateTimeField()
    status = models.CharField(max_length=16, default='new')
    created_at = models.DateTimeField(auto_now_add=True)


    def get_reset_link (self):
        expiry = self.expire_time.strftime('%Y-%m-%dT%H:%M:%S')
        return f"http://localhost:3000/#/reset-password?token={self.token}&expiry={expiry}"
