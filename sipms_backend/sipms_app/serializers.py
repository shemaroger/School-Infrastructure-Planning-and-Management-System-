from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from datetime import timedelta


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(SchoolSerializer, self).__init__(*args, **kwargs)
        for field in self.fields.values():
            field.required = False
            field.allow_null = True
            field.allow_blank = True
class UserSerializer(serializers.ModelSerializer):
    school = SchoolSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "school",
            'sector',
            "school_id",
        ]

    def update(self, instance, validated_data):
        school = validated_data.pop("school_id", None)
        if school:
            instance.school = school
        return super().update(instance, validated_data)

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    token = serializers.DictField(read_only=True)
    user = UserSerializer(read_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        if not user.check_password(data["password"]):
            raise serializers.ValidationError("Invalid credentials")
        refresh = RefreshToken.for_user(user)
        refresh.access_token.set_exp(lifetime=timedelta(minutes=30))

        data["token"] = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        data["user"] = UserSerializer(user).data
        return data


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    school = SchoolSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password", "role", "school", "school_id","sector"]

    def create(self, validated_data):
        school = validated_data.pop("school_id", None)

        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data["role"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            sector=validated_data["sector"],
            school=school,
        )

        password = validated_data.get("password")
        if password:
            user.set_password(password)
        else:
            user.set_password("12345678!") 
        user.save()
        return user


class PredictionSerializer(serializers.ModelSerializer):
    school = SchoolSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(), write_only=True
    )
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Prediction
        fields = "__all__"

    def create(self, validated_data):
        school = validated_data.pop("school_id")
        prediction = Prediction(school=school, **validated_data)
        prediction.save()
        return prediction




class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

class BudgetTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetTracking
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class PredictionReportSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictionReport
        fields = ['id', 'location', 'document', 'document_url', 'created_by', 'created_by_name', 'created_at','is_sent_to_mineduc','status','approved_at','denial_reason']
        read_only_fields = ['id', 'created_at', 'document_url', 'created_by_name','approved_at']
    
    def get_document_url(self, obj):
        request = self.context.get('request')
        if obj.document and hasattr(obj.document, 'url'):
            if request:
                return request.build_absolute_uri(obj.document.url)
            return obj.document.url
        return None
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return None
class PredictionReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionReport
        fields = ['location', 'document', 'created_by']
    
    def validate_document(self, value):
        # Allow all file types
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        return value
