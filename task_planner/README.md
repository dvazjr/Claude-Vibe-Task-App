# Task Planner Django App

A modern task planning and management application built with Django.

## Features

- 🔐 **User Authentication**: Secure registration, login, and logout
- 📋 **Task Management**: Create, organize, and track your tasks
- 📅 **Calendar Integration**: Schedule and view your tasks
- 🎨 **Modern UI**: Beautiful, responsive design with glass-morphism effects
- 🔒 **Security**: Environment-based configuration, CSRF protection

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd task_planner
```

### 2. Set Up Virtual Environment

```bash
# Create virtual environment
python -m venv virt

# Activate virtual environment
# On Windows:
virt\Scripts\activate
# On macOS/Linux:
source virt/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
# Generate a new secret key for production
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///./db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

**🚨 SECURITY WARNING**: Never commit your `.env` file to version control!

### 5. Database Setup

```bash
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run the Development Server

```bash
python manage.py runserver
```

Visit `http://localhost:8000` to view the application.

## Security Notes

### Environment Variables

This application uses environment variables for configuration. The following files should **NEVER** be committed to version control:

- `.env` - Contains secret keys and sensitive configuration
- `db.sqlite3` - Contains user data and passwords
- `__pycache__/` - Python cache files
- `virt/` - Virtual environment files

### Production Deployment

For production deployment:

1. **Generate a new SECRET_KEY**:
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

2. **Set DEBUG=False** in your `.env` file

3. **Configure ALLOWED_HOSTS** with your domain

4. **Use a production database** (PostgreSQL, MySQL)

5. **Set up proper static file serving**

## Project Structure

```
task_planner/
├── task_planner/          # Django project settings
│   ├── settings.py        # Main configuration
│   ├── urls.py           # URL routing
│   └── ...
├── website/              # Main application
│   ├── templates/        # HTML templates
│   ├── views.py         # View functions
│   ├── auth_views.py    # Authentication views
│   └── ...
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
├── .gitignore         # Git ignore rules
└── manage.py         # Django management script
```

## Authentication Features

- **Registration**: Create new user accounts with validation
- **Login**: Secure user authentication
- **Logout**: Session termination with confirmation
- **Password Validation**: Django's built-in password security
- **CSRF Protection**: Cross-site request forgery protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (when available)
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).