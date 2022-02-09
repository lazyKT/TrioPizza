import sendgrid
import os
from sendgrid.helpers.mail import *
from django.core.mail import send_mail, EmailMessage


API_KEY = os.environ.get('TP_SENDGRID_API_KEY')


# def send_email (recipients, subject, body):
#     try:
#         send_mail(
#             subject,
#             body,
#             'kxlim005@mymail.sim.edu.sg',
#             recipients,
#             fail_silently=False,
#         )
#     except Exception as e:
#         raise e


def get_email_template (action):
    if action == 'wlc_customer':
        return 'd-4202a77f05f543a38d4aa3ca6e008358'
    elif action == 'wlc_rest_owner':
        return 'd-fd2039ef79e644d982ab04643d7abff6'
    elif action == 'forgot_password':
        return 'd-81624fee8aef48c0bf94a1d466b17434'
    elif action == 'order_cfm_restaurant':
        return 'd-4b0be427d7da4c22851f6ba67fbbbc24'
    elif action == 'order_cfm_customer':
        return 'd-1d27d9d0291f4f9890a6c0db6ee40d38'
    elif action == 'reservation_customer':
        return 'd-978da8378e5c4ed6b9bee8d3955681de'
    elif action == 'reservation_restowner':
        return 'd-ff57e205af0f47b88d0c277ca9d97b60'
    elif action == 'support_ack':
        return 'd-9f3eb8b0c30140ef8e9750dce9792d33'
    else:
        raise Exception('unknown email action')


def send_email (recipients, template_id, data):
    try:
        print('send_email', recipients, template_id, data)
        msg = EmailMessage(
            from_email='TrioPizza <kxlim005@mymail.sim.edu.sg>',
            to=recipients
        )

        msg.template_id=template_id
        msg.dynamic_template_data = data
        msg.send(fail_silently=False)
    except Exception as e:
        raise e
