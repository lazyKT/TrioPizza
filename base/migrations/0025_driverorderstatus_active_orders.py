# Generated by Django 3.2.9 on 2022-01-10 13:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0024_alter_driverorderstatus_driver'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverorderstatus',
            name='active_orders',
            field=models.IntegerField(default=0),
        ),
    ]
