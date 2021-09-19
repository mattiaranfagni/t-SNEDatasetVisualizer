# That's an impressive list of imports.
import numpy as np
from numpy import linalg
from numpy.linalg import norm
from scipy.spatial.distance import squareform, pdist
# We import sklearn.
import sklearn
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.datasets import load_digits
from sklearn.preprocessing import scale

# We'll hack a bit with the t-SNE code in sklearn 0.15.2.
from sklearn.metrics.pairwise import pairwise_distances
from sklearn.manifold._t_sne import (_joint_probabilities,
                                    _kl_divergence)
import timeit
from . import mnist_reader
#import mnist_reader

def getTSNE():
    # Random state.
    RS = 11111997
    # This list will contain the positions of the map points at every iteration.
    positions = []
    def _gradient_descent(objective, p0, it, n_iter, n_iter_check=1, n_iter_without_progress=30,
                        momentum=0.5, learning_rate=1000.0, min_gain=0.01,
                        min_grad_norm=1e-7, min_error_diff=1e-7, verbose=0,
                        args=[], kwargs=None):
        # The documentation of this function can be found in scikit-learn's code.
        p = p0.copy().ravel()
        update = np.zeros_like(p)
        gains = np.ones_like(p)
        error = np.finfo(np.float).max
        best_error = np.finfo(np.float).max
        best_iter = 0

        for i in range(it, n_iter):
            # We save the current position.
            positions.append(p.copy())

            new_error, grad = objective(p, *args)
            error_diff = np.abs(new_error - error)
            error = new_error
            grad_norm = linalg.norm(grad)

            if error < best_error:
                best_error = error
                best_iter = i
            elif i - best_iter > n_iter_without_progress:
                break
            if min_grad_norm >= grad_norm:
                break
            if min_error_diff >= error_diff:
                break

            inc = update * grad >= 0.0
            dec = np.invert(inc)
            gains[inc] += 0.05
            gains[dec] *= 0.95
            np.clip(gains, min_gain, np.inf)
            grad *= gains
            update = momentum * update - learning_rate * grad
            p += update

        return p, error, i
    sklearn.manifold._t_sne._gradient_descent = _gradient_descent

    #digits = load_digits()
    data,target = mnist_reader.load_mnist('data/fashion', kind='t10k')

    data = data[:4000]
    target = target[:4000]
    # We first reorder the data points according to the handwritten numbers.
    X = np.vstack([data[target==i]
                for i in range(10)])
    y = np.hstack([target[target==i]
                for i in range(10)])
    
    
    X_proj = TSNE(n_components =3, verbose=1, perplexity=50.0, n_jobs=32, random_state=RS).fit_transform(X)
    X_iter = np.dstack(position.reshape(-1, 3)
                    for position in positions)

    shape = X_iter.shape      
    X_iter_proj_iter = np.zeros((shape[2], shape[0], shape[1]), dtype=float)


    for i in range(shape[0]):
        for j in range(shape[1]):
            for k in range(shape[2]):
                X_iter_proj_iter[k][i][j] = X_iter[i][j][k]

    return X_iter_proj_iter,y

