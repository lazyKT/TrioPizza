from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from base.utils import get_email_template, send_email
from base.models import Support
from base.serializers import SupportSerializer


class SupportListView (APIView):
    """
    # View All Support Lists or Create Support Enquiry
    """

    def get (self, request, format=None):
        supports = Support.objects.all()
        serializer = SupportSerializer(supports, many=True)
        return Response(serializer.data)


    def validate_post_request (self, data):
        error = True
        if 'email' not in data:
            return error, 'Email is required*'
        elif 'type' not in data:
            return error, 'Contact Matter is required*'
        elif 'headline' not in data:
            return error, 'Contact Headline is required*'
        elif 'content' not in data:
            return error, 'Content is required*'
        else:
            error = False
            return error, ''


    def post (self, request, format=None):
        try:
            data = request.data
            error, message = self.validate_post_request(data)
            if error:
                return Response({'details' : message}, status=status.HTTP_400_BAD_REQUEST)
            support = Support.objects.create(
                email=data['email'],
                type=data['type'],
                headline=data['headline'],
                content=data['content']
            )
            email_template = get_email_template('support_ack')
            send_email([data['email']], email_template, dict())
            serializer = SupportSerializer(support)
            return Response(serializer.data)
        except Exception as e:
            error = 'Internal Server Error!' if str(e) == '' else str(e)
            return Response({'details' : error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
