# Generated by Django 3.2.9 on 2021-12-06 21:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('base', '0008_review_createdat'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='auth.user')),
                ('type', models.CharField(blank=True, max_length=30)),
                ('mobile', models.CharField(blank=True, max_length=8)),
            ],
        ),
    ]
