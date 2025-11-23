from django.urls import path
from .views import *


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('users/detail/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    path("login/", LoginView.as_view(), name="login"),
    path("schools/", SchoolListCreateView.as_view(), name="schools"),
    path('schools/<int:pk>/', SchoolRetrieveUpdateDestroyView.as_view(), name='school-detail'),
    path('schools/detail/<int:pk>/', SchoolDetailView.as_view(), name='school-detail'),
    path("predictions/", PredictionListCreateView.as_view(), name="predictions"),
    path("predictions/<int:pk>/approve/", PredictionApprovalUpdateView.as_view(), name="prediction-approve"),
    path("projects/", ProjectListCreateView.as_view(), name="projects"),
    path("budget/", BudgetTrackingListCreateView.as_view(), name="budget"),
    path("district-summary/", DistrictSummaryView.as_view(), name="district-summary"),
    path('notifications/', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('notifications/<int:id>/', NotificationDetailView.as_view(), name='notification-detail'),

    path('prediction-reports/', PredictionReportListCreateView.as_view(), name='prediction-report-list-create'),
    path('prediction-reports/upload/', PredictionReportUploadView.as_view(),name='prediction-report-upload'),

    path('prediction-reports/<int:pk>/', PredictionReportDetailView.as_view(), name='prediction-report-detail'),
    path('prediction-reports/by-location/<str:location>/', get_reports_by_location, name='reports-by-location'),

    path('send-to-mineduc/<int:report_id>/', send_to_mineduc, name='send-to-mineduc'),
    path("prediction-reports/mineduc/approve/<int:id>/", approve_report),
    path("prediction-reports/mineduc/deny/<int:id>/", deny_report),

]

