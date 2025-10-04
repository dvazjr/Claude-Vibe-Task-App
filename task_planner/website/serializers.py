from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'date', 'time', 'text', 'completed',
            'font_size', 'font_weight', 'font_style',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskCreateSerializer(serializers.Serializer):
    """
    Custom serializer for creating multiple tasks at once from the modal
    """
    date = serializers.DateField()
    time_slots = serializers.ListField(
        child=serializers.TimeField(),
        allow_empty=False
    )
    text = serializers.CharField(max_length=1000)
    font_size = serializers.IntegerField(default=16)
    font_weight = serializers.ChoiceField(
        choices=[('normal', 'Normal'), ('bold', 'Bold'), ('lighter', 'Light')],
        default='normal'
    )
    font_style = serializers.ChoiceField(
        choices=[('normal', 'Normal'), ('italic', 'Italic')],
        default='normal'
    )

    def create(self, validated_data):
        user = self.context['request'].user
        date = validated_data['date']
        time_slots = validated_data.pop('time_slots')

        tasks = []
        for time_slot in time_slots:
            task_data = validated_data.copy()
            task_data['time'] = time_slot
            task_data['user'] = user
            task_data['date'] = date

            # Check if task already exists for this user, date, time
            existing_task = Task.objects.filter(
                user=user,
                date=date,
                time=time_slot
            ).first()

            if existing_task:
                # Update existing task
                for key, value in task_data.items():
                    if key != 'user':  # Don't update user
                        setattr(existing_task, key, value)
                existing_task.save()
                tasks.append(existing_task)
            else:
                # Create new task
                task = Task.objects.create(**task_data)
                tasks.append(task)

        return tasks