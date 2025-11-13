from django.urls import path
from . import views

urlpatterns = [
    path('report-problem/', views.report_problem, name='report_problem'),
]