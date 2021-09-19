from django.contrib.postgres.fields import ArrayField
from django.db import models
#from django.db.models.fields import FloatField
#from djongo import models
#from djongo.models.fields import ArrayField

# Create your models here.
class ProcessedTSNE(models.Model):
    data = ArrayField(ArrayField(ArrayField(models.FloatField(default = None))))
    values = ArrayField(models.FloatField(default = None))
    labels = ArrayField(models.CharField(max_length=200))
    perplexity = models.IntegerField(default=-1)
    random_state = models.IntegerField(default=-1)
    dataset = models.IntegerField(default=-1)    #0 for train (FMNIST), 1 for test (FMNIST), 2 for digits
    images = ArrayField(ArrayField(models.FloatField(default = None, blank=True, null=True),blank=True, null=True),blank=True, null=True)