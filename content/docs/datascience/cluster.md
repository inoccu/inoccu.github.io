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
from sklearn.preprocessing import scale

X = [iris.data[0], iris.data[1], iris.data[2], 
     iris.data[50], iris.data[51], iris.data[52], 
     iris.data[100], iris.data[101], iris.data[102]
    ]
X_sc = scale(X)
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