# Generated by Django 3.2.9 on 2022-01-17 17:34

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0034_auto_20220117_1536'),
    ]

    operations = [
        migrations.AddField(
            model_name='promos',
            name='expiry_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
