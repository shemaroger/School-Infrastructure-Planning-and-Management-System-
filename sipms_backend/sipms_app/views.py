from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.core.files.base import ContentFile
from .models import *
from .serializers import *
from rest_framework import status
from .models import PredictionReport
from .serializers import PredictionReportSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
import tempfile
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        else:
            print("Registration error:", serializer.errors)
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

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully!", "data": serializer.data})
        else:
            print("Update error:", serializer.errors)  
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class SchoolListCreateView(generics.ListCreateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class SchoolRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]

    def perform_update(self, serializer):
        serializer.save()


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]


class PredictionListCreateView(generics.ListCreateAPIView):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PredictionApprovalUpdateView(generics.UpdateAPIView):
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
        except Exception as e:
            print("❌ Error while saving:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {field: getattr(instance, field) for field in allowed_fields},
            status=status.HTTP_200_OK
        )

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        if self.request.user.role == "DISTRICT":
            serializer.save(district=self.request.user)
        else:
            serializer.save()


class BudgetTrackingListCreateView(generics.ListCreateAPIView):
    queryset = BudgetTracking.objects.all()
    serializer_class = BudgetTrackingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

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

class NotificationListCreateView(generics.ListCreateAPIView):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]  
    
class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class PredictionReportListCreateView(generics.ListCreateAPIView):
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
        serializer.save()
        
        output_serializer = PredictionReportSerializer(serializer.instance, context={'request': request})
        
        return Response({
            'success': True,
            'message': 'Report saved successfully',
            'data': output_serializer.data
        }, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class PredictionReportDetailView(generics.RetrieveDestroyAPIView):
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



class PredictionReportUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PredictionReportCreateSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            response_data = PredictionReportSerializer(
                report, context={'request': request}
            ).data
            return Response({
                "success": True,
                "message": "PDF uploaded successfully",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        print("UPLOAD ERRORS:", serializer.errors)
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
    
    return Response({
        "success": True,
        "message": "Report denied",
        "reason": reason
    })