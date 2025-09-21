from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from . import auth_views as custom_auth_views

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
]
