---
title: 回帰分析の基礎
date: 2020-05-01
url: /docs/datascience/linear-regression.html
math: true
---

## 単回帰分析

anscombeデータセットを用いた単回帰分析を行う。

```python
import seaborn as sns
anscombe = sns.load_dataset('anscombe')
print(anscombe)
```

出力の一部は下記のとおり。

```
   dataset     x      y
0        I  10.0   8.04
1        I   8.0   6.95
2        I  13.0   7.58
3        I   9.0   8.81
4        I  11.0   8.33
5        I  14.0   9.96
6        I   6.0   7.24
7        I   4.0   4.26
8        I  12.0  10.84
9        I   7.0   4.82
10       I   5.0   5.68
11      II  10.0   9.14
```

anscombeデータセットは、4つのデータセットがまとまったものなので、ここではデータセットIを使用する。matplotlibを使用して散布図を描く。

```python
%matplotlib inline
from matplotlib import pyplot as plt

dataset1 = anscombe[anscombe['dataset'] == 'I']
plt.scatter(dataset1['x'], dataset1['y'])
```

![img](data:image/png;base64,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)

$x$が増加すると$y$も増加するという正の相関が見える。  
さらに、直線関係も見えるため（線形）、$y=ax+b$という一次式をあてはめ、係数$a$と切片$b$を求める。  
$x$の値が分かれば$y$の値を予測することができるようになる。
上記の一次式で求めた値が予測値であることを示すため、$\hat{y}$のように表現する。

$\hat{y}$は予測値、実際に測定した$y$を実測値とすると、$\epsilon=y-\hat{y}$で求めた実測値と予測値の誤差$\epsilon$を求めることができる。これを残差という。  
残差は正負どちらの値を取ることもあるため、$\epsilon^2$のように二乗した上で、データセットのすべての値についての残差を合計した残差平方和（residual sum of squares）を求める。
$$
Q = \sum_{i=1}^{n}\epsilon_i^2 = \sum_{i=1}^{n}(y_i-(ax_i+b))^2
$$
$Q$を最小にする$a$と$b$を求めるために、最小二乗法を用いることができる。

scikit-learnでは、最小二乗法を用いた線形回帰分析を下記のように行う。

```python
from sklearn import linear_model

x = dataset1['x'].values # numpy.ndarrayに変換
x = x.reshape(-1, 1) # 2次元データに変換、-1はデータに沿って値を決めることを示す
y = dataset1['y'].values
y = y.reshape(-1, 1)

# 線形回帰
model = linear_model.LinearRegression()
model.fit(x, y)
```

係数$a$と、切片$b$は、下記のようになる。

```python
print('係数: %s' % model.coef_)
print('切片: %s' % model.intercept_)
```

```
係数: [[0.50009091]]
切片: [3.00009091]
```

つまり、下記の回帰式が得られたことになる。
$$
y = 0.5001x+3.0001
$$
先ほどの実測値の散布図に、回帰式の直線を描くと下図のようになる。

```python
plt.scatter(x, y)

x_for_pred = list(range(15))
y_pred = []
for x_temp in x_for_pred:
    y_pred.append(model.coef_[0][0] * x_temp + model.intercept_[0])

plt.plot(x_for_pred, y_pred, color='red')
plt.show()
```

![img](data:image/png;base64,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)

求めた回帰式を用いて予測を行う。

```python
pred = model.predict(x)
pred
```

下記のような予測値が得られる。

```
array([[ 8.001     ],
       [ 7.00081818],
       [ 9.50127273],
       [ 7.50090909],
       [ 8.50109091],
       [10.00136364],
       [ 6.00063636],
       [ 5.00045455],
       [ 9.00118182],
       [ 6.50072727],
       [ 5.50054545]])
```

## 決定係数

上記で求めた予測値は、実測値との間に残差がある。
$$
1 = \frac{\sum_{i=1}^{n}予測値_i^2}{\sum_{i=1}^{n}実測値_i^2} + \frac{\sum_{i=1}^{n}\epsilon_i^2}{\sum_{i=1}^{n}実測値_i^2}
$$
予測値平方和と実測値平方和の割合と、残差平方和と実測値平方和の割合の和を求めると1になる。これは残差が実測値と予測値の差であるから自明といえる。  
前者の割合が1に近づく（逆に後者の割合が0に近づく）方が、予測の精度は高いといえる。

この前者の割合（予測値平方和と実測値平方和の割合）を、寄与率もしくは決定係数という。  
この値を求めるとき、予測値平方和および実測値平方和は偏差平方和としてする。

```python
import numpy as np

# 偏差を求めるため平均値（メジアン）を求めておく
y_mean = np.mean(y)
p_mean = np.mean(pred)

ysos = 0 # 実測値の偏差平方和 y sum of squares
psos = 0 # 予測値の偏差平方和 pred sum of squares
rsos = 0 # 残差平方和 residual sum of squares
for i in range(0, len(y)):
    ysos += (y_mean - y[i]) ** 2
    psos += (p_mean - pred[i]) ** 2
    residual = y[i] - pred[i]
    rsos += residual ** 2
    
print('1になると正しい: %f' % (psos/ysos + rsos/ysos))
print('決定係数(R^2): %f' % (psos/ysos))
```

出力は下記のとおり。

```
1になると正しい: 1.000000
決定係数(R^2): 0.666542
```

決定係数は、scikit-learnを用いて下記のように求めることができる。

```python
from sklearn.metrics import r2_score
print('決定係数(R^2): %f' % r2_score(y, pred))
print('決定係数(R^2): %f' % model.score(x, y))
```

出力される決定係数は、先に求めたものと同じである。

```
決定係数(R^2): 0.666542
決定係数(R^2): 0.666542
```

ところで、決定係数$R^2$は説明変数の数を増やすと（ここまででは説明変数が1つの単回帰分析を説明したが、説明変数が複数になると重回帰分析という）、大きな値になる性質がある。しかし、説明変数が増えれば必ずしも予測精度が高まるというわけではないため、その場合、決定係数は用いることができない。

自由度調整済み決定係数$\hat{R}^2$は、その問題に対応したものである。
$$
\hat{R}^2 = 1 - \frac{\frac{\sum_{i=1}^{n}\epsilon^2}{N-p-1}}{\frac{\sum_{i=1}^{n}実測値^2}{N-1}}
$$
ここで、Nはデータ数、pを説明変数の数とする。

scikit-learnでは自由度調整済み決定係数を求めることができないため、Pythonで下記のように計算する。

```python
N = len(x) # データ数
p = 1 # 説明変数の数

print('自由度調整済み決定係数: %f' % (1 - (rsos/(N-p-1))/(ysos/(N-1))))
```

求められた自由度調整済み決定係数は、下記のとおり。

```
自由度調整済み決定係数: 0.629492
```