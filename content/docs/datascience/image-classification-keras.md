---
title: 画像認識の基礎（tf.keras.applications）
date: 2021-05-14
url: /docs/datascience/image-classification-keras.html
math: true
draft: false
---

TensorFlow / Kerasを使用した画像認識（分類タスク）のファインチューニングについて。

## tf.keras.applcationsに含まれるアルゴリズム

- ResNet
  - 2015年に登場、100層以上のネットワークを構成し精度を向上させた
  - https://arxiv.org/abs/1512.03385
  - デフォルトの入力サイズは224x224
  - ResNet50（50層）、ResNet101（101層）、ResNet152（152層）
- DenseNet
  - 2017年に登場、ResNetを踏まえて開発された
  - デフォルトの入力サイズは224x224
  - DenseNet121（121層）、DenseNet169（169層）、DenseNet201（201層）
- efficientetnet
- inception_resnet_v2
  - 2017年に登場
  - https://arxiv.org/abs/1602.07261
  - デフォルトの入力サイズは299x299
- inception_v3
- mobilenet
- mobilenet_v2
- mobilenet_v3
- nasnet
- resnet_v2
- vgg16
- vgg19
- xception

### 比較（Keras Documentationによる）

精度評価はImageNetによる。  
Top-1 Accuracyは、最上位の予測結果が正答である精度。  
Top-5 Accuraryは、上位5個の予測結果に正答が含まれる精度。

|Model|Size|Top-1 Accuracy|Top-5 Accuracy|Parameters|Depth|
| ---- | ---- | ---- | ---- | ---- | ---- |
|Xception|88 MB|0.790|0.945|22,910,480|126|
|VGG16|528 MB|0.715|0.901|138,357,544|23|
|VGG19|549 MB|0.727|0.910|143,667,240|26|
|ResNet50|99 MB|0.759|0.929|25,636,712|168|
|InceptionV3|92 MB|0.788|0.944|23,851,784|159|
|InceptionResNetV2|215 MB|0.804|0.953|55,873,736|572|
|MobileNet|17 MB|0.665|0.871|4,253,864|88|
|DenseNet121|33 MB|0.745|0.918|8,062,504|121|
|DenseNet169|57 MB|0.759|0.928|14,307,880|169|
|DenseNet201|80 MB|0.770|0.933|20,242,984|201|

### Kerasにおける引数

各アルゴリズムで共通に用いられる引数（抜粋）

- weights: None or 'imagenet' imagenetを使用した初期の学習を行うか否か。Noneの場合は各ニューロンのウエイトの初期値はランダム。
- include_top: 出力層側にある全結合層を含むかどうか。
- classes: 出力層のニューロン数（分類したいクラス数）。include_topがTrueでweightsがNoneの場合しか指定できない。
- input_shape: 入力する画像の形状。

### コード例

```python
import tensorflow as tf

base_model = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=False)
x = base_model.output
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dense(512, activation='relu')(x)
x = tf.keras.layers.Dense(256, activation='relu')(x)
preds = tf.keras.layers.Dense(3, activation='softmax')(x)

model = tf.keras.Model(inputs=base_model.input, outputs=preds)

# ベースモデル部分は再学習しない（Non-trainable params）
for layer in base_model.layers:
    layer.trainable=False

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()
```

作成されたネットワークはこのようになる。（長いので途中は省略）  
include_topがFalseのため、dense (Dense)以下の3層は上記コード内で追加したもの。

```
__________________________________________________________________________________________________
Layer (type)                    Output Shape         Param #     Connected to                     
==================================================================================================
input_1 (InputLayer)            [(None, None, None,  0                                            
__________________________________________________________________________________________________
Conv1 (Conv2D)                  (None, None, None, 3 864         input_1[0][0]                    
__________________________________________________________________________________________________
bn_Conv1 (BatchNormalization)   (None, None, None, 3 128         Conv1[0][0]                      
__________________________________________________________________________________________________
Conv1_relu (ReLU)               (None, None, None, 3 0           bn_Conv1[0][0]                   
__________________________________________________________________________________________________
expanded_conv_depthwise (Depthw (None, None, None, 3 288         Conv1_relu[0][0]                 
__________________________________________________________________________________________________
（中略）
__________________________________________________________________________________________________
dense (Dense)                   (None, 512)          655872      global_average_pooling2d[0][0]   
__________________________________________________________________________________________________
dense_1 (Dense)                 (None, 256)          131328      dense[0][0]                      
__________________________________________________________________________________________________
dense_2 (Dense)                 (None, 3)            771         dense_1[0][0]                    
==================================================================================================
Total params: 3,045,955
Trainable params: 787,971
Non-trainable params: 2,257,984
__________________________________________________________________________________________________
```

続きのコード。これでモデルのトレーニングが行われる。

```python
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    preprocessing_function = tf.keras.applications.mobilenet_v2.preprocess_input)

train_generator = train_datagen.flow_from_directory('train',
                                                 color_mode='rgb',
                                                 batch_size=10,
                                                 class_mode='categorical',
                                                 shuffle=True)

log_file = model.fit_generator(generator=train_generator,
                   steps_per_epoch=5,
                   epochs=100)
```

トレーニングの過程を可視化する。

```python
plt.plot(log_file.history['accuracy'], '-bo', label="train_accuracy")
plt.plot(log_file.history['loss'], '-r*', label="train_loss")
plt.title('Training Loss and Accuracy')
plt.ylabel('Loss/Accuracy')
plt.xlabel('Epoch #')
plt.legend(loc='center right')
plt.show()
```



## 参考文献

- https://keras.io/ja/applications/
- https://deepsquare.jp/2020/04/resnet-densenet/