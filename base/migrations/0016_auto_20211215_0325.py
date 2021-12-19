# Generated by Django 3.2.9 on 2021-12-15 03:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0015_alter_product_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='shippingAddress',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='remark',
            field=models.CharField(blank=True, default='', max_length=523, null=True),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='totalPrice',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
            preserve_default=False,
        ),
    ]
