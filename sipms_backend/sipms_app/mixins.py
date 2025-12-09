from .models import ActionLog
from django.contrib.auth.models import AnonymousUser

class ActionLogMixin:
    def log_action(self, request, action, model_name, object_id=None, details=None):
        user = None
        if hasattr(request, 'user') and not isinstance(request.user, AnonymousUser):
            user = request.user

        ActionLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=object_id,
            details=details
        )