from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from apps.organizations.models import Organization

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'season', 'race_date')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        username_input = attrs.get(self.username_field)
        if username_input:
            user = User.objects.filter(email__iexact=username_input).first()
            if user:
                attrs[self.username_field] = user.username
        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    unit_id = serializers.IntegerField(source='unit.id', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    accessible_unit_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'organization', 'unit_id', 'unit_name', 'accessible_unit_ids')

    def get_accessible_unit_ids(self, obj):
        from apps.accounts.permissions import get_visible_unit_ids
        return get_visible_unit_ids(obj)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        # Use email as username
        username = validated_data['email']
        user = User.objects.create(
            username=username,
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=False  # Must be approved by admin
        )
        user.set_password(validated_data['password'])
        user.save()
        return user