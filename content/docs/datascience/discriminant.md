---
title: 判別分析の基礎
date: 2020-05-04
math: true
---

irisデータセットについて判別分析を行う。

irisデータセットは、下図のようなものである。ここでは、花びらの長さ（sepal length）と、がくの長さ（petal length）の2つの値を使う。

```python
%matplotlib inline
import pandas as pd
from sklearn.datasets import load_iris
from matplotlib import pyplot as plt

# irisデータセットを取得し、targetを含めたDataFrameを作成
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df = pd.concat([df, pd.Series(iris.target, name='target')], axis=1)

# 花びらとがくの長さだけに絞る
df2 = df[[iris.feature_names[0], iris.feature_names[2], 'target']]

# 品種ごとに分ける
a = df2[df2['target'] == 0]
b = df2[df2['target'] == 1]
c = df2[df2['target'] == 2]

xa = a[iris.feature_names[0]].values
ya = a[iris.feature_names[2]].values
xb = b[iris.feature_names[0]].values
yb = b[iris.feature_names[2]].values
xc = c[iris.feature_names[0]].values
yc = c[iris.feature_names[2]].values

# 可視化
ax = plt.subplot()
ax.scatter(xa, ya, marker='o', color='red', label=iris.target_names[0])
ax.scatter(xb, yb, marker='x', color='blue', label=iris.target_names[1])
ax.scatter(xc, yc, marker='v', color='green', label=iris.target_names[2])
ax.set_xlabel(iris.feature_names[0])
ax.set_ylabel(iris.feature_names[2])
ax.legend()
plt.show()
```

![img](data:image/png;base64,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lpYWKipK7j+xMaGr7lHNW9PfCuXcuXxoSEn14Bsa4IornKAOzs8rrnDWZ+qqq67i9ttvj7pGAz/96U+56aabGDZsGIMHD2b27NkArF27lmOPPZapU6dywgkn8N577zFhwgSOP/54Bg0atG/U6oQJE1iyZAkAL730EqeccgpDhgzhxBNPZPv27ezevZuJEycyaNAg6urqeOqpp9q164MPPuD8889n8ODBDB8+nFdeeWVf+yZPnsyZZ57JxRdfnPkbN8aEIpcPDSmZAK8KW7fC3Ln7g/wVVzivt27dH/TTNW7cOBYvXrzv9a9+9Suqqqr4+9//zosvvkhTUxONjY0888wzgDOL5MUXX8zLL7/M+++/z4YNG1i9ejWrVq1i4sSJMef+5JNP+MIXvsDcuXNZuXIlS5cupUuXLtx2222AM03CAw88wCWXXNJu8rHZs2dTV1fHK6+8wo033hgTzBsbG/nNb37D/fcX9jf8xnREuXxoSMl8fheBSAeZuXOdBWDGDGd9pmmauro6Nm/ezMaNG2lubqZ379688sorPPHEE9TVOUOWd+zYwd///nf69etH//79GT58OACHH344b7/9NtOmTeOcc87hzDPPjDn3mjVrqK6uZtiwYQD07NkTgOeee45p06YBzqRl/fv354033og59rnnnuOhhx4C4PTTT2fLli1s2+bMyjxmzBi6dOmS2Rs2pkAV2/NQk3G/xP3Zyz/jk9ZPQn1oSMn04CE2yLuyCe6usWPHsmTJEhYvXsy4ceNQVa6++up9Uwa/+eabfPWrXwWgW7du+47r3bs3K1euZNSoUdx2221MmjQp5ryqiiRonJ/5gRLt454rug3GlIpiex5qKn5KMYNQUgHeTctEi87JZ2rcuHE8+OCDLFmyhLFjx3LWWWfx85//nB07dgCwYcMGNm/e3O64999/n7a2Ni688EJ+8IMfsGLFipjtxxxzDBs3buSll14CYPv27bS0tDBixAgWRR41+MYbb/Duu+9y9NFHxxwbvc+yZcvo06fPvk8AxpSiYnseaiq5KsUsmRRNdM7dTcu4ryG7nvzAgQPZvn07ffv2pbq6murqal5//XVOPvlkALp3787ChQspLy+POW7Dhg1MnDiRtjZn/ugf/vCHMds7d+7M4sWLmTZtGrt27aJLly4sXbqUqVOnMmXKFAYNGkRFRQX33nsvn/rU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)

## 平均と分散

```python
import numpy as np

str_format = '[%s]\nがく平均:%f がく分散:%f 花びら平均:%f 花びら分散:%f'
print(str_format % (iris.target_names[0], np.mean(xa), np.std(xa), np.mean(ya), np.std(ya)))
print(str_format % (iris.target_names[1], np.mean(xb), np.std(xb), np.mean(yb), np.std(yb)))
print(str_format % (iris.target_names[2], np.mean(xc), np.std(xc), np.mean(yc), np.std(yc)))
```

```
[setosa]
がく平均:5.006000 がく分散:0.348947 花びら平均:1.462000 花びら分散:0.171919
[versicolor]
がく平均:5.936000 がく分散:0.510983 花びら平均:4.260000 花びら分散:0.465188
[virginica]
がく平均:6.588000 がく分散:0.629489 花びら平均:5.552000 花びら分散:0.546348
```

がくの長さは、品種ごとの平均が近似しており、分散が大きいため、判別に用いるのは難しい。  
一方、花びらの長さの分布は平均がずれており（特にsetosaとversicolor）、分散が小さいため、判別に適している。

花びらの長さについて、setosaとversicolorの平均値からの距離を求め、判別を試みる。  
距離$d$は、次式で求める。$\bar{x}$は$x$の平均値、$s^2$は標準偏差である。
$$
d = \frac{(x-\bar{x})^2}{s^2}
$$
距離が短い方に判別される。

```python
for i in range(0, 100):
    d1 = ((iris.data[i][2] - np.mean(ya)) ** 2) / (np.std(ya)) ** 2
    d2 = ((iris.data[i][2] - np.mean(yb)) ** 2) / (np.std(yb)) ** 2
    print('正答:%i 判別結果:%i (%3.4f, %3.4f)' % (iris.target[i], not d1<d2, d1, d2))
```

```
正答:0 判別結果:0 (0.1301, 37.7985)
正答:0 判別結果:0 (0.1301, 37.7985)
（中略）
正答:1 判別結果:1 (354.7383, 0.8946)
正答:1 判別結果:1 (312.2697, 0.2662)
（後略）
```

## 線形判別分析
versicolorとvirginicaの2品種について、線形判別分析（Linear Discriminant Analysis）を行う。

```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

x = pd.concat([b.drop('target', axis=1), c.drop('target', axis=1)], axis=0).values
y = pd.concat([b['target'], c['target']], axis=0).values

lda = LinearDiscriminantAnalysis()
lda.fit(x, y)
print('係数', lda.scalings_)

# グループの平均と係数の線形結合の平均が定数値
cv = np.mean(np.dot(lda.means_, lda.scalings_))
print('定数値', cv)
```

```
係数 [[-1.63793744]
 [ 3.15236795]]
定数値 5.208752927587185
```

次の線形判別式が得られた。
$$
z = -1.64x_1 + 3.15x_2 - 5.21
$$

```python
for i in range(len(x)):
    result = x[i][0] * lda.scalings_[0] + x[i][1] * lda.scalings_[1] - cv
    transform = lda.transform(x[i].reshape(1,-1))
    print('正答:%s 判別結果:%i LDA:%f (%f)' % (y[i], (not result<0)+1, result, transform))
```

```
正答:1 判別結果:1 LDA:-1.858186 (-1.858186)
正答:1 判別結果:1 LDA:-1.505897 (-1.505897)
（中略）
正答:1 判別結果:2 LDA:0.258782 (0.258782)
（中略）
正答:2 判別結果:2 LDA:3.386449 (3.386449)
正答:2 判別結果:2 LDA:1.368286 (1.368286)
（後略）
```