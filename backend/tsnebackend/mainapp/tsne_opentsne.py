from openTSNE import TSNE,TSNEEmbedding
from sklearn.datasets import load_digits
import numpy as np
from sklearn.decomposition import PCA
from . import mnist_reader

def getTSNE_FashionMNIST(perplexity,train = True):
    positions = []
    def callback_save(iteration: int, error: float, embedding: TSNEEmbedding):
        positions.append(embedding.tolist().copy())
        return False
    tsne = TSNE(
        n_components=3,
        perplexity=perplexity,
        metric="euclidean",
        callbacks=callback_save,
        n_jobs=-1,
        random_state=42,
        verbose=True,
        n_iter = 1000,
        negative_gradient_method='barnes-hut',
        initialization = 'random'
    )
    
    data_type = 'train' if train else 't10k'
    data,target = mnist_reader.load_mnist('data/fashion', kind=data_type)
    X = np.vstack([data[target==i]
                for i in range(10)])
    y = np.hstack([target[target==i]
                for i in range(10)])

    pca_50 = PCA(n_components=50)
    pca_result_50 = pca_50.fit_transform(X)
    print("PCA Done. Starting t-SNE.")
    try:
        embedding_train = tsne.fit(pca_result_50)
    except RuntimeError:
        print("Runtime Error")
    return positions,y,X

def getTSNE_Digits(perplexity):
    positions = []
    def callback_save(iteration: int, error: float, embedding: TSNEEmbedding):
        positions.append(embedding.tolist().copy())
        return False

    tsne = TSNE(
        n_components=3,
        perplexity=perplexity,
        metric="euclidean",
        callbacks=callback_save,
        n_jobs=-1,
        random_state=42,
        verbose=True,
        n_iter = 2000,
        negative_gradient_method='barnes-hut',
        initialization = 'random'
    )

    digits = load_digits()
    data = digits["data"]
    target = digits["target"]

    X = np.vstack([data[target==i]
                for i in range(10)])
    y = np.hstack([target[target==i]
                for i in range(10)])

    pca_50 = PCA(n_components=50)
    pca_result_50 = pca_50.fit_transform(X)

    print("PCA Done. Starting t-SNE.")
    try:
        embedding_train = tsne.fit(pca_result_50)
    except RuntimeError:
        print("Runtime Error")
    return positions,y,X