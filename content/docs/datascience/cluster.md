---
title: クラスター分析の基礎
url: /docs/datascience/cluster.html
date: 2020-05-28
math: true
---

irisデータセットについてクラスター分析を行う。

irisデータセットは150個のデータからできており、3つの品種についてそれぞれ50個のデータが入っている。問題を簡単にするため、それぞれの品種について3つのデータを取ることにする。

```python
from sklearn.datasets import load_iris

iris = load_iris()
print(iris.target[0], iris.target[1], iris.target[2])
print(iris.target[50], iris.target[51], iris.target[52])
print(iris.target[100], iris.target[101], iris.target[102])
```

このように、品種0、品種1、品種2がそれぞれ3件ずつであることが分かる。

```
0 0 0
1 1 1
2 2 2
```

対応するデータを取得し、標準化を行う。  
ちなみに、scikit-learnを用いて標準化した値と、R言語のscale関数で求めた値は[デルタの自由度の値が異なるため、違う値になる](https://ja.coder.work/so/python/1294886)ことに注意する。

```python
from sklearn.preprocessing import StandardScaler

X = [iris.data[0], iris.data[1], iris.data[2], 
     iris.data[50], iris.data[51], iris.data[52], 
     iris.data[100], iris.data[101], iris.data[102]
    ]

sc = StandardScaler()
X_sc = sc.fit_transform(X)
X_sc
```

このようなデータが得られる。

```
array([[-1.04454175,  1.73925271, -1.35065657, -1.30321735],
       [-1.27106888, -0.63245553, -1.35065657, -1.30321735],
       [-1.497596  ,  0.31622777, -1.40444378, -1.30321735],
       [ 1.10746595,  0.31622777,  0.42432131,  0.14778753],
       [ 0.42788457,  0.31622777,  0.31674689,  0.26870461],
       [ 0.99420239, -0.15811388,  0.53189573,  0.26870461],
       [ 0.31462101,  0.79056942,  1.12355502,  1.47787534],
       [-0.25169681, -2.05548048,  0.63947014,  0.7523729 ],
       [ 1.22072952, -0.63245553,  1.06976781,  0.99420705]])
```

## データ間の距離を求める

1件目のデータ$x_{1}$と2件目のデータ$x_2$について、ユーグリッド距離を求める。  
ユーグリッド距離は、それぞれの値の差の平方を足して、その平方根を求めたものである。
$$
d = \sqrt{(x_{1,1}-x_{2,1})^2 + (x_{1,2}-x_{2,2})^2 + (x_{1,3}-x_{2,3})^2 + (x_{1,4}-x_{2,4})^2}
$$

```python
# X_sc[0]とX_sc[1]のユーグリッド距離を求める
import numpy as np
np.sqrt((X_sc[0][0] - X_sc[1][0]) ** 2 +
        (X_sc[0][1] - X_sc[1][1]) ** 2 +
        (X_sc[0][2] - X_sc[1][2]) ** 2 +
        (X_sc[0][3] - X_sc[1][3]) ** 2)
```

```
2.3825017395837125
```

scikit-learnでは、下記のように求める。

```python
# ユーグリッド距離を求める
from sklearn.neighbors import DistanceMetric
dist = DistanceMetric.get_metric('euclidean')
dist.pairwise(X_sc)
```

```
array([[0.        , 2.38250174, 1.49437319, 3.45139085, 3.0731437 ,
        3.71098632, 4.07474207, 4.81815926, 4.67900277],
       [2.38250174, 0.        , 0.9768355 , 3.43706118, 3.00626276,
        3.37215001, 4.2890106 , 3.35412806, 4.16481359],
       [1.49437319, 0.9768355 , 0.        , 3.49802011, 3.02339402,
        3.55730355, 4.19933149, 3.9471889 , 4.43724864],
       [3.45139085, 3.43706118, 3.49802011, 0.        , 0.69858718,
        0.51383054, 1.76399106, 2.80787035, 1.43033416],
       [3.0731437 , 3.00626276, 3.02339402, 0.69858718, 0.        ,
        0.76941854, 1.53325205, 2.53474183, 1.61925829],
       [3.71098632, 3.37215001, 3.55730355, 0.51383054, 0.76941854,
        0.        , 1.78156825, 2.32331059, 1.04497594],
       [4.07474207, 4.2890106 , 4.19933149, 1.76399106, 1.53325205,
        1.78156825, 0.        , 3.0300838 , 1.75580771],
       [4.81815926, 3.35412806, 3.9471889 , 2.80787035, 2.53474183,
        2.32331059, 3.0300838 , 0.        , 2.10634259],
       [4.67900277, 4.16481359, 4.43724864, 1.43033416, 1.61925829,
        1.04497594, 1.75580771, 2.10634259, 0.        ]])
```

距離を求める方法としては、他に絶対距離（市街地距離、マンハッタン距離）、ミンコフスキー距離、マハラノビス距離がある。

## 階層型（凝集型）クラスタリング

scikit-learnで階層型クラスタリングを行う。  
`affinity`の値は距離の求め方（デフォルトはユーグリッド距離）、`linkage`はクラスター間の距離をどの点に基づいて求めるかを示す。  
`linkage`には、下記の種類がある。

- 最短距離法（`single`）
- 最長距離法（`complete`）
- 平均距離法（`average`）
- 重心距離法
- ウォード法（`ward`）※ウォード法を用いる場合、`affinity`はユーグリッド距離のみが使用できる

ここではウォード法を用いる。

```python
# 階層型（凝集型）クラスタリング
from sklearn.cluster import AgglomerativeClustering

ac = AgglomerativeClustering(
    affinity='euclidean', 
    linkage='ward',
    distance_threshold=0, 
    n_clusters=None)
ac.fit(X_sc)
```

階層型クラスタリングによって求めたクラスター間の距離を図示する方法として、デンドログラムがある。下記の関数を定義して描くことができる。  
＜参考＞ https://scikit-learn.org/stable/auto_examples/cluster/plot_agglomerative_dendrogram.html

```python
def plot_dendrogram(model, **kwargs):
    counts = np.zeros(model.children_.shape[0])
    n_samples = len(model.labels_)
    for i, merge in enumerate(model.children_):
        current_count = 0
        for child_idx in merge:
            if child_idx < n_samples:
                current_count += 1  # leaf node
            else:
                current_count += counts[child_idx - n_samples]
        counts[i] = current_count

    linkage_matrix = np.column_stack([model.children_, model.distances_,
                                      counts]).astype(float)

    dendrogram(linkage_matrix, **kwargs)
```

```python
from scipy.cluster.hierarchy import dendrogram

labels = range(1, len(X)+1)
plot_dendrogram(ac, labels=labels)
```

![img](data:image/png;base64,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)

このように、1番目から3番目までのデータ、4番目から6番目までのデータはうまくクラスターに分類できているが、7番目から9番目までのデータについては鎖状効果が発生しておりうまく分類できていない。

クラスターの各階層の距離を求める。

```python
for i in range(len(ac.children_)):
    a = (ac.children_[i][0] + 1) * -1 if ac.children_[i][0] <= len(ac.children_) else ac.children_[i][0] - len(ac.children_)
    b = (ac.children_[i][1] + 1) * -1 if ac.children_[i][1] <= len(ac.children_) else ac.children_[i][1] - len(ac.children_)
    print('%2i %3i %3i %0.3f' % (i+1, a, b, ac.distances_[i]))
```

```
 1  -4  -6 0.514
 2  -5   1 0.795
 3  -2  -3 0.977
 4  -9   2 1.630
 5  -7   4 1.994
 6  -1   3 2.226
 7  -8   5 3.139
 8   6   7 6.979
```

ここでは、4番目のデータと6番目のデータで形成した1つ目のクラスターの距離が0.514、5番目のデータと1つ目のクラスターで形成した2つ目のクラスターの距離が0.795であることを示す。

## 非階層型クラスタリング

階層型クラスタリングで用いた9件のデータについて、非階層型クラスタリング手法であるK-Meansで3つのクラスターに分類する。

```python
from sklearn.cluster import KMeans

kms = KMeans(n_clusters=3, random_state=0)
kms.fit(X_sc)

for i in range(0, len(kms.labels_)):
    print(kms.labels_[i])
```

```
1
1
1
0
0
0
0
2
0
```

1つ目の品種については上手くクラスターを形成できているが、2つ目と3つ目の品種については上手くいっていない。

次に、150個すべてのデータを用いたクラスタリングを行う。まず、主成分分析を行い、第2主成分までを求めた上でK-Meansで3つのクラスターに分類する。

```python
# 主成分分析を行い第2主成分までを使用する
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# すべてのデータを使用する
X = iris.data

# 標準化
sc = StandardScaler()
X_sc = sc.fit_transform(X)

# 主成分分析を行い、第2主成分までに射影する
pca = PCA(n_components=2)
pca.fit(X_sc)
X_projection = pca.transform(X_sc)

# K-Meansでクラスタリングする
kms = KMeans(n_clusters=3, random_state=0)
kms.fit(X_projection)
kms.labels_
```

このような結果が得られる。やはり2つ目と3つ目の品種の分類は上手く行かない。

```
array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
       1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
       1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0,
       2, 2, 2, 2, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2,
       2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0,
       0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0,
       0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2], dtype=int32)
```

散布図を描く。

```python
%matplotlib inline
from matplotlib import pyplot as plt

ax = plt.subplot()

markers = ['x', 'v', 'o']
colors = ['red', 'green', 'blue']

for i in range(0, len(X_projection)):
    ax.scatter(X_projection[i][0], X_projection[i][1], 
               marker=markers[kms.labels_[i]], color=colors[kms.labels_[i]])
plt.show()
```

![img](data:image/png;base64,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)

