from rest_framework import serializers
from .models import ProcessedTSNE

class TSNESerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProcessedTSNE
        fields = ['point', 'n_iter', 'perplexity', 'x', 'y', 'z', 'value']
