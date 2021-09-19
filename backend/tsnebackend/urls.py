"""tsnebackend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .mainapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tsne_train', views.getTsne_FashionMNIST_train_Insert, name='getTsne_FashionMNIST_train'),
    path('tsne_test', views.getTsne_FashionMNIST_test_Insert, name='getTsne_FashionMNIST_test'),
    path('tsne_digits', views.getTSNE_Digits_Insert, name='getTSNE_Digits'),
    path('tsne', views.getTsneFromDB_, name='getTSNEDataSQL'),
    path('mnistimg', views.getFMNISTImages, name='getFMNISTImages')
]