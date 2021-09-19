from django.shortcuts import render
from django.core import serializers
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import numpy as np
from .tsne_opentsne import getTSNE_FashionMNIST,getTSNE_Digits
from . import models
from rest_framework import viewsets
from rest_framework import permissions
from .serializers import TSNESerializer
from . import mnist_reader
from sklearn.datasets import load_digits

#from .tsne import getTSNE
#tsne.py

@csrf_exempt
def getTsne_FashionMNIST_train_Insert(request):
    perplexity = 70
    array,values,images = getTSNE_FashionMNIST(perplexity, train=True)
    values = values.tolist()
    images = images.tolist()
    labels = []
    values_text = {
        0 : 'T-shirt/top',
        1 : 'Trouser',
        2 : 'Pullover',
        3 : 'Dress',
        4 : 'Coat',
        5 : 'Sandal',
        6 : 'Shirt',
        7 : 'Sneaker',
        8 : 'Bag',
        9 : 'Ankle boot'
    }
    for i in range(len(values)):
        el = values[i]
        labels.append(values_text[int(el)])
    models.ProcessedTSNE.objects.create(
        data = array,
        values = values,
        labels = labels,
        perplexity = perplexity,
        random_state = 42,
        dataset = 0,
        images = images
    )
    return JsonResponse({"data" : array, "values" : values, "labels" : labels}, safe=False)

@csrf_exempt
def getTsne_FashionMNIST_test_Insert(request):
    perplexity = 70
    array,values,images = getTSNE_FashionMNIST(perplexity, train=False)
    values = values.tolist()
    images = images.tolist()
    labels = []
    values_text = {
        0 : 'T-shirt/top',
        1 : 'Trouser',
        2 : 'Pullover',
        3 : 'Dress',
        4 : 'Coat',
        5 : 'Sandal',
        6 : 'Shirt',
        7 : 'Sneaker',
        8 : 'Bag',
        9 : 'Ankle boot'
    }
    for i in range(len(values)):
        el = values[i]
        labels.append(values_text[int(el)])
    models.ProcessedTSNE.objects.create(
        data = array,
        values = values,
        labels = labels,
        perplexity = perplexity,
        random_state = 42,
        dataset = 1,
        images = images
    )
    return JsonResponse({"data" : array, "values" : values, "labels" : labels}, safe=False)

@csrf_exempt
def getTSNE_Digits_Insert(request):
    perplexity = 70
    array,values,images = getTSNE_Digits(perplexity)
    values = values.tolist()
    images = images.tolist()

    models.ProcessedTSNE.objects.create(
        data = array,
        values = values,
        labels = values,
        perplexity = perplexity,
        random_state = 42,
        dataset = 2,
        images = images
    )
    return JsonResponse({"data" : array, "values" : values ,"images" : images}, safe=False)

@csrf_exempt
def getTsneFromDB(request):
    data = models.ProcessedTSNE.objects.all().filter(id=6).values() #train (train)
    #data = models.ProcessedTSNE.objects.all().filter().values() #test 10k (t10k)
    #data = models.ProcessedTSNE.objects.all().filter(id = 10).values() #test digits (load_digits)
    return JsonResponse(list(data), safe=False)

@csrf_exempt
def getTsneFromDB_(request):
    dataset = request.POST.get('dataset')
    perplexity = request.POST.get('perplexity')
    print(dataset, perplexity)
    data = models.ProcessedTSNE.objects.all().filter(dataset = dataset).filter(perplexity = perplexity).values()
    #print(data)
    return JsonResponse(list(data), safe=False)

@csrf_exempt
def getFMNISTImages(request):
    data,target = mnist_reader.load_mnist('data/fashion', kind='t10k') #t10k or train
    data = data.tolist()
    target = target.tolist()
    #digits = load_digits()
    #data = digits['data'].tolist()
    #target = digits['target'].tolist()
    return JsonResponse({"data" : data[500],"target" : target[500]}, safe=False)

@csrf_exempt
class TSNEViewSet(viewsets.ModelViewSet):
    queryset = models.ProcessedTSNE.objects.all()
    serializer_class = TSNESerializer
    permission_classes = [permissions.IsAuthenticated]
