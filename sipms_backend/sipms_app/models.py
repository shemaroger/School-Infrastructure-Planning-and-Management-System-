from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _

class School(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    established_year = models.IntegerField(null=True, blank=True)
    student_population = models.PositiveIntegerField(default=0)
    number_of_rooms = models.PositiveIntegerField(default=0)
    head_teacher = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name
    
    
class User(AbstractUser):
    class Role(models.TextChoices):
        SCHOOL = "SCHOOL", _("School")
        UMURENGE = "UMURENGE", _("Umurenge")
        DISTRICT = "DISTRICT", _("District")
        MINEDUC = "MINEDUC", _("Mineduc")
        ADMIN = "ADMIN", _("admin")

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SCHOOL)
    email = models.EmailField(unique=True)
    sector= models.CharField(max_length=40,null=True,blank=True)
    school = models.ForeignKey(
        School, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="users"
    )

    groups = models.ManyToManyField(
        Group,
        related_name="sipms_users",  
        blank=True,
        help_text=_(
            "The groups this user belongs to. A user will get all permissions "
            "granted to each of their groups."
        ),
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="sipms_users_permissions", 
        blank=True,
        help_text="Specific permissions for this user.",
        related_query_name="user",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username","role","first_name","last_name"]

    def __str__(self):
        return f"{self.username} ({self.role})"

    
class Prediction(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="predictions")
    required_rooms = models.PositiveIntegerField(default=0)
    rooms_to_build = models.PositiveIntegerField(default=0)
    estimated_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    approved_by_district = models.BooleanField(default=False)
    approved_by_mineduc = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.school:
            self.required_rooms = (self.school.student_population + 34) // 35
            self.rooms_to_build = max(self.required_rooms - self.school.number_of_rooms, 0)
            cost_per_room = 5000000
            self.estimated_budget = self.rooms_to_build * cost_per_room
        super().save(*args, **kwargs) 



    def __str__(self):
        return f"Prediction for {self.school.name}"

class Project(models.Model):
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    district = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'DISTRICT'},
        related_name='projects',
    )
    project_name = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    progress_percentage = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project_name} ({self.district.username})"

class BudgetTracking(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="budgets")
    allocated_budget = models.DecimalField(max_digits=15, decimal_places=2)
    spent_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    remaining_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.remaining_budget = self.allocated_budget - self.spent_budget
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Budget for {self.project.project_name}"

class Notification(models.Model):
    class Role(models.TextChoices):
        SCHOOL = "SCHOOL", _("School")
        UMURENGE = "UMURENGE", _("Umurenge")
        DISTRICT = "DISTRICT", _("District")
        MINEDUC = "MINEDUC", _("Mineduc")
        ADMIN = "ADMIN", _("Admin")

    role = models.CharField(max_length=20, choices=Role.choices)
    sender = models.CharField(max_length=20, choices=Role.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} - {self.message[:50]}"
    

class PredictionReport(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("denied", "Denied"),
    )

    location = models.CharField(max_length=255)
    document = models.FileField(upload_to='prediction_reports/%Y/%m/%d/')
    is_sent_to_mineduc = models.BooleanField(default=False)
    
    # NEW FIELDS
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    denial_reason = models.TextField(blank=True, null=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prediction_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'prediction_reports'
        ordering = ['-created_at']
        verbose_name = 'Prediction Report'
        verbose_name_plural = 'Prediction Reports'
    
    def __str__(self):
        return f"Report for {self.location} - {self.created_at.strftime('%Y-%m-%d')}"


class ActionLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('SEND', 'Send'),
        ('APPROVE', 'Approve'),
        ('DENY', 'Deny'),
        ('UPLOAD', 'Upload'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100) 
    object_id = models.PositiveIntegerField(null=True, blank=True) 
    details = models.JSONField(null=True, blank=True) 
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} {self.action} {self.model_name} {self.object_id} at {self.timestamp}"
