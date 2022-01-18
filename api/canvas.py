                              ####
################################################################
import numpy as np
from PIL import Image     # pillow
from matplotlib import cm # color map
from math import inf
import matplotlib.pyplot as plt
from flask import ( Flask, 
                    render_template,
                    request,
                    send_file,
                  )
import os
################################################################
mnist_size   = 28
canvas_size  = mnist_size*10
mnist_data   = np.load( 'mnist/data.npy')
mnist_labels = np.load( 'mnist/labels.npy')
################################################################
# This is a central object, which will serve as a central object
# __name__ will resolve to canvas I guess.
app = Flask( __name__)
################################################################
@app.route( "/submit", methods=[ 'GET', 'POST'])
def submit():
    data = request.json
    a = np.array( data)
    a = convyort( a)
    # after resizing make into 784 1-D vector
    a = a.reshape( mnist_size*mnist_size)
    j = find_match( a)
    matched = mnist_data[ j].reshape(( 28, 28))
    file_path = "matched.png"
    plt.imsave( file_path, matched)
    return send_file( file_path, mimetype="image/png")
###############################################################
def convyort( a):
    ''' convert requested array 'a to mnist format:
    (1) reshape 1D array 'a to 2D
    (2) remoo front/back empty rows and cols (dbox)
    (3) resize max size to 20
    (4) flat PIL.Image
    (5) position unboxed cm in a 28x28 image '''
    # (1) reshape
    m = n = canvas_size
    a = a.reshape( m, n)
    # (2) crop
    a = dbox( a)
    # (3) resize
    rgba = np.uint8( cm.gray( a)*255)
    im = Image.fromarray( rgba)
    f = 20/max( a.shape) # factor
    newshape = [ int( f*x) for x in a.shape]
    im = im.resize( reversed( newshape)) # (width, height)
    # (4) flat
    # for each position (i, j) im has 4 layers (RGBA)
    a = np.array( im) # e.g: a.shape = (20, 19, 4)
    flat = np.empty( a.shape[ :2])
    for i in range( a.shape[ 0]):
        for j in range( a.shape[ 1]):
            flat[ i, j] = a[ i, j][ 0] # R=G=B
    # (5) position
    com = comsat( flat)
    u = 13 - com[ 0], 13 - com[ 1]
    a = np.zeros([ 28, 28])
    a[ u[ 0]:u[ 0] + flat.shape[ 0],
       u[ 1]:u[ 1] + flat.shape[ 1]] = flat
    return a
################################################################
def dbox( a):
    """ Remove top, bottom, left and right empty rows and
    columns from nonempty numpy array. """
    m, n = a.shape
    # top/bottom
    z = np.zeros( n) # empty row
    top, bot = 0, m - 1
    while np.array_equal( a[ top,:], z): top += 1
    while np.array_equal( a[ bot,:], z): bot -= 1
    # left/right
    z = np.zeros( m) # empty colmn
    left, ryte = 0, n - 1
    while np.array_equal( a[ :, left], z): left += 1
    while np.array_equal( a[ :, ryte], z): ryte -= 1
    return a[ top:bot + 1, left:ryte + 1]
################################################################
def comsat( a):
    ''' center of mass '''
    com = [ 0, 0]
    for j in 0, 1:
        # axis = 0 is columnwize
        m = np.mean( a, axis=j)
        p = m/sum( m)
        x = np.arange( len( m))
        com[ 1 - j] = int( np.dot( p, x))
    return com
################################################################
def find_match( u):
    ''' yeh! '''
    min_dist2 = inf
    min_j = -1
    for j, v in enumerate( mnist_data):
        dist2 = get_dist2( u, v)
        if dist2 < min_dist2:
            min_dist2 = dist2
            min_j = j
    return min_j
################################################################
def get_dist2( u, v):
    ''' Euclidian squared '''
    return np.sum( np.square( u - v))
################################################################
# log: - submitting empty image                               []
# - save png file to /tmp
################################################################
####                                                        ####
