from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    text = models.TextField()
    completed = models.BooleanField(default=False)

    # Text formatting fields
    font_size = models.IntegerField(default=16)
    font_weight = models.CharField(
        max_length=20,
        choices=[
            ('normal', 'Normal'),
            ('bold', 'Bold'),
            ('lighter', 'Light'),
        ],
        default='normal'
    )
    font_style = models.CharField(
        max_length=20,
        choices=[
            ('normal', 'Normal'),
            ('italic', 'Italic'),
        ],
        default='normal'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']
        unique_together = ['user', 'date', 'time']

    def __str__(self):
        return f"{self.user.username} - {self.date} {self.time}: {self.text[:50]}"
