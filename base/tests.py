from django.test import TestCase
from django.contrib.auth.hashers import make_password
from base.models import (
    User,
    Profile,
    Product,
    Restaurant,
    Order,
    Restaurant,
    OrderItem,
    PreOrder
)


print('Been Here @ tests.py')

"""
# User Test Cases
"""
class UserTestCase (TestCase):

    def create_user_object (self, username, name, mobile, type, password):
        """
        # Create User and Profile Object
        """
        user = User.objects.create(
            username=username,
            password=make_password(password)
        )
        profile = user.profile
        profile.type = type
        profile.mobile = mobile
        profile.name = name
        profile.save()


    def setUp (self):
        self.create_user_object('testuser1@email.com', 'Test User 1', '12341234', 'driver', 'password')
        self.create_user_object('testuser2@email.com', 'Test User 2', '12341234', 'customer', 'password')


    def test_users_profile_attr (self):
        user1 = User.objects.get(username='testuser1@email.com')
        user2 = User.objects.get(username='testuser2@email.com')
        # Test Cases for User 1
        self.assertEqual(user1.profile.name, 'Test User 1')
        self.assertEqual(user1.is_staff, False)
        # Test Cases for User 2
        self.assertEqual(user2.profile.name, 'Test User 2')
        self.assertEqual(user2.is_staff, False)
