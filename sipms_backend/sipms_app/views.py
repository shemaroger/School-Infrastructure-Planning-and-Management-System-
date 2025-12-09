from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import *
from .serializers import *
from .mixins import ActionLogMixin

# --- Mixin for Action Logging ---

# --- User Views ---
class RegisterView(ActionLogMixin, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Log the registration
            self.log_action(
                request,
                action='CREATE',
                model_name='User',
                object_id=user.id,
                details={'email': user.email}
            )
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

class UserRetrieveUpdateDestroyView(ActionLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            # Log the update
            self.log_action(
                request,
                action='UPDATE',
                model_name='User',
                object_id=instance.id,
                details={'updated_fields': request.data.keys()}
            )
            return Response({"message": "User updated successfully!", "data": serializer.data})
        else:
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Log the delete
        self.log_action(
            request,
            action='DELETE',
            model_name='User',
            object_id=instance.id
        )
        instance.delete()
        return Response({"message": "User deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
    

class LoginView(ActionLogMixin, generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_data = serializer.validated_data.get('user', {})
        user_id = user_data.get('id')
        user_email = user_data.get('email')

        self.log_action(
            request,
            action='LOGIN',
            model_name='User',
            object_id=user_id,
            details={'email': user_email}
        )

        return Response(serializer.validated_data)


# --- School Views ---
class SchoolListCreateView(ActionLogMixin, generics.ListCreateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        school = serializer.save()
        # Log the creation
        self.log_action(
            self.request,
            action='CREATE',
            model_name='School',
            object_id=school.id,
            details={'name': school.name}
        )

class SchoolRetrieveUpdateDestroyView(ActionLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]

    def perform_update(self, serializer):
        school = serializer.save()
        # Log the update
        self.log_action(
            self.request,
            action='UPDATE',
            model_name='School',
            object_id=school.id,
            details={'updated_fields': self.request.data.keys()}
        )

    def perform_destroy(self, instance):
        # Log the delete
        self.log_action(
            self.request,
            action='DELETE',
            model_name='School',
            object_id=instance.id
        )
        instance.delete()

class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]

# --- Prediction Views ---
class PredictionListCreateView(ActionLogMixin, generics.ListCreateAPIView):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        prediction = serializer.save(created_by=self.request.user)
        # Log the creation
        self.log_action(
            self.request,
            action='CREATE',
            model_name='Prediction',
            object_id=prediction.id,
            details={'school': prediction.school.id}
        )

class PredictionApprovalUpdateView(ActionLogMixin, generics.UpdateAPIView):
    queryset = Prediction.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        allowed_fields = ["approved_by_district", "approved_by_mineduc"]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        if not update_data:
            return Response(
                {"error": "Only approval fields can be updated."},
                status=status.HTTP_400_BAD_REQUEST
            )
        for field, value in update_data.items():
            setattr(instance, field, value)
        try:
            instance.save()
            # Log the approval
            self.log_action(
                request,
                action='APPROVE',
                model_name='Prediction',
                object_id=instance.id,
                details={'approved_by': field}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {field: getattr(instance, field) for field in allowed_fields},
            status=status.HTTP_200_OK
        )

# --- Project Views ---
class ProjectListCreateView(ActionLogMixin, generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        project = serializer.save()
        # Log the creation
        self.log_action(
            self.request,
            action='CREATE',
            model_name='Project',
            object_id=project.id,
            details={'name': project.name}
        )

# --- Budget Tracking Views ---
class BudgetTrackingListCreateView(ActionLogMixin, generics.ListCreateAPIView):
    queryset = BudgetTracking.objects.all()
    serializer_class = BudgetTrackingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        budget = serializer.save()
        # Log the creation
        self.log_action(
            self.request,
            action='CREATE',
            model_name='BudgetTracking',
            object_id=budget.id,
            details={'amount': budget.amount}
        )

# --- District Summary View ---
class DistrictSummaryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        umurenge_id = request.query_params.get("umurenge")
        predictions = Prediction.objects.filter(school__umurenge_id=umurenge_id)
        total_rooms = sum([p.rooms_to_build for p in predictions])
        total_budget = sum([p.estimated_budget for p in predictions])
        data = {
            "umurenge": umurenge_id,
            "total_schools": predictions.count(),
            "total_rooms_to_build": total_rooms,
            "total_estimated_budget": total_budget,
        }
        return Response(data)

# --- Notification Views ---
class NotificationListCreateView(ActionLogMixin, generics.ListCreateAPIView):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        notification = serializer.save()
        # Log the creation
        self.log_action(
            self.request,
            action='CREATE',
            model_name='Notification',
            object_id=notification.id,
            details={'title': notification.title}
        )

class NotificationDetailView(ActionLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def perform_update(self, serializer):
        notification = serializer.save()
        # Log the update
        self.log_action(
            self.request,
            action='UPDATE',
            model_name='Notification',
            object_id=notification.id,
            details={'updated_fields': self.request.data.keys()}
        )

    def perform_destroy(self, instance):
        # Log the delete
        self.log_action(
            self.request,
            action='DELETE',
            model_name='Notification',
            object_id=instance.id
        )
        instance.delete()

# --- Prediction Report Views ---
class PredictionReportListCreateView(ActionLogMixin, generics.ListCreateAPIView):
    queryset = PredictionReport.objects.all()
    serializer_class = PredictionReportSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = PredictionReport.objects.all()
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = PredictionReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        # Log the creation
        self.log_action(
            request,
            action='CREATE',
            model_name='PredictionReport',
            object_id=report.id,
            details={'location': report.location}
        )
        output_serializer = PredictionReportSerializer(report, context={'request': request})
        return Response({
            'success': True,
            'message': 'Report saved successfully',
            'data': output_serializer.data
        }, status=status.HTTP_201_CREATED)

class PredictionReportDetailView(ActionLogMixin, generics.RetrieveDestroyAPIView):
    queryset = PredictionReport.objects.all()
    serializer_class = PredictionReportSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Log the delete
        self.log_action(
            request,
            action='DELETE',
            model_name='PredictionReport',
            object_id=instance.id
        )
        if instance.document:
            instance.document.delete()
        instance.delete()
        return Response({
            'success': True,
            'message': 'Report deleted successfully'
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_reports_by_location(request, location):
    reports = PredictionReport.objects.filter(location__iexact=location)
    serializer = PredictionReportSerializer(reports, many=True, context={'request': request})
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

class PredictionReportUploadView(ActionLogMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PredictionReportCreateSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            # Log the upload
            self.log_action(
                request,
                action='UPLOAD',
                model_name='PredictionReport',
                object_id=report.id,
                details={'location': report.location}
            )
            response_data = PredictionReportSerializer(
                report, context={'request': request}
            ).data
            return Response({
                "success": True,
                "message": "PDF uploaded successfully",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "success": False,
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def send_to_mineduc(request, report_id):
    try:
        report = PredictionReport.objects.get(id=report_id)
        report.is_sent_to_mineduc = True
        report.save()
        # Log the send
        ActionLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            action='SEND',
            model_name='PredictionReport',
            object_id=report.id,
            details={'sent_to_mineduc': True}
        )
        return Response({'success': True, 'message': 'Report sent to MINEDUC'})
    except PredictionReport.DoesNotExist:
        return Response({'success': False, 'message': 'Report not found'}, status=404)

@api_view(['POST'])
def approve_report(request, id):
    report = get_object_or_404(PredictionReport, id=id)
    report.status = "approved"
    report.denial_reason = None
    report.approved_at = timezone.now()
    report.save()
    # Log the approve
    ActionLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action='APPROVE',
        model_name='PredictionReport',
        object_id=report.id,
        details={'status': 'approved'}
    )
    return Response({
        "success": True,
        "message": "Report approved successfully"
    })

@api_view(['POST'])
def deny_report(request, id):
    report = get_object_or_404(PredictionReport, id=id)
    reason = request.data.get("reason", "")
    report.status = "denied"
    report.denial_reason = reason
    report.approved_at = None
    report.save()
    # Log the deny
    ActionLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action='DENY',
        model_name='PredictionReport',
        object_id=report.id,
        details={'status': 'denied', 'reason': reason}
    )
    return Response({
        "success": True,
        "message": "Report denied",
        "reason": reason
    })

# --- Action Log View ---
class ActionLogListView(generics.ListAPIView):
    queryset = ActionLog.objects.all().order_by('-timestamp')
    serializer_class = ActionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
