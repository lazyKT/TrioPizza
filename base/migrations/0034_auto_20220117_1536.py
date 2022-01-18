# Generated by Django 3.2.9 on 2022-01-17 15:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0033_remove_featureproduct_priority'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='promos',
            name='code',
        ),
        migrations.AddField(
            model_name='promos',
            name='description',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='promos',
            name='product',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='base.product'),
        ),
    ]
