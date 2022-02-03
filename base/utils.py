from django.core.mail import send_mail


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
