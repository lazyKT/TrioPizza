import sendgrid
import os
from sendgrid.helpers.mail import *
from django.core.mail import send_mail


API_KEY = os.environ.get('TP_SENDGRID_API_KEY')


def send_email (recipients, subject, body):
    try:
        send_mail(
            subject,
            body,
            'kxlim005@mymail.sim.edu.sg',
            recipients,
            fail_silently=False,
        )
    except Exception as e:
        raise e


# # send email to user
# def send_email (recipient, subject, body):
#     """
#     # Send new prescription email and link to patient
#     """
#     print(API_KEY)
#     sg = sendgrid.SendGridAPIClient(api_key=API_KEY)
#     from_email = Email('ktl141@uowmail.edu.au')
#     to_email = To(recipient)
#     try:
#         mail = Mail(from_email, to_email, subject, html_content=HtmlContent(body))
#         response = sg.client.mail.send.post(request_body=mail.get())
#         # print("email sent response")
#         # print(response.status_code)
#         # print(response.body)
#         # print(response.headers)
#     except Exception as e:
#         # print(e.body)
#         raise(e)
