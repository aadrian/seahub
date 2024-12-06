# Copyright (c) 2012-2016 Seafile Ltd.

import os
import logging

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import SessionAuthentication

from seahub.base.accounts import User
from seahub.base.templatetags.seahub_tags import email2contact_email
from seahub.utils import EVENTS_ENABLED, get_user_activities, is_valid_email
from seahub.utils.timeutils import utc_datetime_to_isoformat_timestr
from seahub.api2.utils import api_error
from seahub.api2.throttling import UserRateThrottle
from seahub.api2.authentication import TokenAuthentication
from seahub.base.templatetags.seahub_tags import email2nickname
from seahub.avatar.templatetags.avatar_tags import api_avatar_url

logger = logging.getLogger(__name__)


class UserActivitiesView(APIView):
    authentication_classes = (TokenAuthentication, SessionAuthentication)
    permission_classes = (IsAdminUser, )
    throttle_classes = (UserRateThrottle, )

    def get(self, request):
        if not EVENTS_ENABLED:
            events = None
            return api_error(status.HTTP_404_NOT_FOUND, 'Events not enabled.')

        # argument check
        user = request.GET.get('user', '')
        if not user:
            error_msg = 'user invalid.'
            return api_error(status.HTTP_400_BAD_REQUEST, error_msg)
        else:
            if not is_valid_email(user):
                error_msg = 'user invalid.'
                return api_error(status.HTTP_400_BAD_REQUEST, error_msg)

        # resource check
        try:
            user_obj = User.objects.get(email=user)
        except User.DoesNotExist:
            error_msg = 'User %s not found.' % user
            return api_error(status.HTTP_404_NOT_FOUND, error_msg)

        try:
            page = int(request.GET.get('page', ''))
        except ValueError:
            page = 1

        try:
            per_page = int(request.GET.get('per_page', ''))
        except ValueError:
            per_page = 25

        start = (page - 1) * per_page
        count = per_page

        try:
            events = get_user_activities(user, start, count)
        except Exception as e:
            logger.error(e)
            error_msg = 'Internal Server Error'
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, error_msg)

        events_list = []
        for e in events:
            d = dict(op_type=e.op_type)
            d['repo_id'] = e.repo_id
            d['repo_name'] = e.repo_name
            d['obj_type'] = e.obj_type
            d['commit_id'] = e.commit_id
            d['path'] = e.path
            d['name'] = '' if e.path == '/' else os.path.basename(e.path)
            d['author_email'] = e.op_user
            d['author_name'] = email2nickname(e.op_user)
            d['author_contact_email'] = email2contact_email(e.op_user)

            url, is_default, date_uploaded = api_avatar_url(e.op_user)
            d['avatar_url'] = url
            d['time'] = utc_datetime_to_isoformat_timestr(e.timestamp)

            if e.op_type == 'clean-up-trash':
                d['days'] = e.days
            elif e.op_type == 'rename' and e.obj_type == 'repo':
                d['old_repo_name'] = e.old_repo_name
            elif e.op_type == 'move' and e.obj_type in ['dir', 'file']:
                d['old_path'] = e.old_path
            elif e.op_type == 'rename' and e.obj_type in ['dir', 'file']:
                d['old_path'] = e.old_path
                d['old_name'] = os.path.basename(e.old_path)
            elif e.op_type == 'publish':
                d['old_path'] = e.old_path
            events_list.append(d)

        response = {'events': events_list}

        return Response(response)
