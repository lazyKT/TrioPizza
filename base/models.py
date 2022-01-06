from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

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



class Product(models.Model):

    name = models.CharField(max_length=200, blank=True, default='Pizza Name')
    description = models.TextField(null=True, blank=True)
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
    paymentMethod = models.CharField(max_length=200, null=True, blank=True)
    taxPrice = models.DecimalField(
        max_digits=7, decimal_places=2, null=True, blank=True)
    shippingAddress = models.TextField(null=True, blank=True)
    shippingPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    totalPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    isPaid = models.BooleanField(default=False)
    paidAt = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    isDelivered = models.BooleanField(default=False)
    deliveredAt = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    deliveredBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='driver')
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
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    current_order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=10, default='available')
    last_assigned = models.BooleanField(default=False)
    total_order = models.IntegerField(default=0)

    def __str__(self):
        return 'driver name: %s, status: %s' % (self.driver.profile.name, self.status)


class Reservation (models.Model):
    _id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    num_of_pax = models.IntegerField()
    status = models.CharField(max_length=16, default='active')
    pre_order = models.BooleanField(default=False)
    reservedDateTime = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)


class PreOrder (models.Model):
    _id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
