# Generated by Django 3.2.9 on 2022-01-26 15:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0043_auto_20220126_1551'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='preorder',
            name='totalPrice',
        ),
    ]
