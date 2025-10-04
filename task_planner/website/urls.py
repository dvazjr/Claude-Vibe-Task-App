from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views
from . import auth_views as custom_auth_views
from . import api_views

urlpatterns = [
    path("", views.home, name="home"),
    path("login/", auth_views.LoginView.as_view(
        template_name='login.html',
        redirect_authenticated_user=True,
        extra_context={'title': 'Login'}
    ), name="login"),
    path("logout/", auth_views.LogoutView.as_view(next_page='logout_success'), name="logout"),
    path("logout/success/", views.logout_success, name="logout_success"),
    path("register/", custom_auth_views.register_view, name="register"),

    # API endpoints
    path("api/tasks/", api_views.TaskListCreateView.as_view(), name="api_tasks"),
    path("api/tasks/<int:pk>/", api_views.TaskDetailView.as_view(), name="api_task_detail"),
    path("api/tasks/create-multiple/", api_views.create_multiple_tasks, name="api_create_multiple_tasks"),
    path("api/tasks/date/<str:date_str>/", api_views.get_tasks_for_date, name="api_tasks_for_date"),
    path("api/tasks/<int:task_id>/toggle/", api_views.toggle_task_completion, name="api_toggle_task"),

    # Debug endpoint
    path("api/debug/", api_views.debug_view, name="api_debug"),
]
