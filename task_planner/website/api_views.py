from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer


class TaskListCreateView(generics.ListCreateAPIView):
    """
    List all tasks or create a new task for the authenticated user
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)

        # Filter by date if provided
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)

        # Filter by month/year if provided
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        if month and year:
            queryset = queryset.filter(date__month=month, date__year=year)

        return queryset


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a task instance
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_multiple_tasks(request):
    """
    Create multiple tasks from the modal form data
    """
    serializer = TaskCreateSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        tasks = serializer.save()
        task_serializer = TaskSerializer(tasks, many=True)
        return Response({
            'message': f'{len(tasks)} tasks created successfully',
            'tasks': task_serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tasks_for_date(request, date_str):
    """
    Get all tasks for a specific date
    """
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )

    tasks = Task.objects.filter(user=request.user, date=date).order_by('time')
    serializer = TaskSerializer(tasks, many=True)

    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_task_completion(request, task_id):
    """
    Toggle the completion status of a task
    """
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        task.completed = not task.completed
        task.save()

        serializer = TaskSerializer(task)
        return Response(serializer.data)

    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET', 'POST'])
def debug_view(request):
    """
    Simple debug endpoint to test if the API is working
    """
    return Response({
        'message': 'API is working!',
        'method': request.method,
        'user_authenticated': request.user.is_authenticated,
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous'
    })