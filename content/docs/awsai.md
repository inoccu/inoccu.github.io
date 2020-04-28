---
title: 「使ってわかったAWSのAI」コードリスト
date: 2020-05-26
---

書籍[「使ってわかったAWSのAI」](https://www.amazon.co.jp/dp/4865942467/)（井上研一＝著、リックテレコム＝刊）のコードリストです。

## 第3章 AIサービス

### 3.2.5 認証情報の保存

```
[default]
aws_access_key_id = ＜アクセスキーID＞
aws_secret_access_key = ＜シークレットアクセスキー＞
```

### 3.2.7 Jupyter NotebookでAWS SDK for Pythonを使う

```python
!pip install --upgrade boto3
```

```python
import boto3

client = boto3.client('s3', region_name='ap-northeast-1')
client.list_buckets()
```

### 3.3.2 画像を用いたモノの検出

```python
import boto3
import json

client = boto3.client('rekognition', region_name='ap-northeast-1')

with open('dog.jpg', 'rb') as image_file:
    bytes_data = image_file.read()
    response = client.detect_labels(Image={'Bytes': bytes_data})
    
    print(json.dumps(response, indent=2))
```

### 3.3.3 画像を用いた顔の検出

```python
import boto3
import json

client = boto3.client('rekognition', region_name='ap-northeast-1')

with open('persons.jpg', 'rb') as image_file:
    bytes_data = image_file.read()
    response = client.detect_faces(Image={'Bytes': bytes_data}, Attributes=['ALL'])

    print(json.dumps(response, indent=2))
```

### 3.4.2 自然言語を識別する

```python
import boto3
import json

client = boto3.client('comprehend', region_name='us-east-1')

text = '貴社の記者が汽車で帰社した'

response = client.detect_dominant_language(Text=text)
print(json.dumps(response, indent=2))
```

### 3.4.3 エンティティを抽出する

```python
import boto3
import json

client = boto3.client('comprehend', region_name='us-east-1')
text = 'Amazon Comprehend は、機械学習を使用してテキスト内でインサイトや関係性を検出する自然言語処理 (NLP) サービスです。機械学習の経験は必要ありません。\
\
構造化されていないデータには膨大な量の潜在的な宝物があります。お客様の E メール、サポートチケット、製品レビュー、ソーシャルメディア、広告コピーが、ビジネスの役に立つ顧客感情のインサイトを表します。問題はそれをどのようにして手に入れるかです。 このように、機械学習は、膨大な数のテキスト内の特定の関心項目 (アナリストレポートで会社名を見つけるなど) を正確に特定することに特に優れており、言語の中に隠された感情 (マイナスのレビューやカスタマーサービスエージェントと顧客の積極的なのやりとりの特定) をほぼ無限の規模で学習することができます。’

response = client.detect_entities(Text=text, LanguageCode='ja')
print(json.dumps(response, indent=2, ensure_ascii=False))
```

### 3.5.2 英語の書類画像からデータを取得する

```python
import boto3
import json

client = boto3.client('textract', region_name='us-east-1')

response = client.analyze_document(
    Document={
        'S3Object': {
            'Bucket': '＜格納先のS3バケット名＞',
            'Name': '＜格納先のS3オブジェクト名＞',
            #'Version': '＜S3でバージョン管理を行っている場合は、バージョン値＞'
	    }
    },
    FeatureTypes=[＜フォームを認識させる場合はFORMS、テーブルを認識させる場合はTABLES＞]
)

print(json.dumps(response, indent=2))
```

### 3.6.2 カスタム用語を使わない翻訳

```python
import boto3
import json

client = boto3.client('translate', region_name='us-east-1')

text = 'Sukiyaki is a song by Japanese crooner Kyu Sakamoto, first released in Japan in 1961. The song topped the charts in several countries, including on the Billboard Hot 100 in 1963. The song has grown to become one of the world\'s best-selling singles of all time, having sold over 13 million copies worldwide.'

response = client.translate_text(
    Text=text,
    SourceLanguageCode='en',
    TargetLanguageCode='ja'
)

print(json.dumps(response, ensure_ascii=False, indent=2))
```

### 3.6.3 カスタム用語を使った翻訳

```
en,ja
Sukiyaki,上を向いて歩こう
```

```python
import boto3
import json

client = boto3.client('translate', region_name='us-east-1')

with open('my_terminology.csv', 'rb') as mt:
    bytes_data = mt.read()
    response = client.import_terminology(
        Name='my_terminology',
        MergeStrategy='OVERWRITE',
        TerminologyData={
            'File': bytes_data,
            'Format': 'CSV'
	    }
    )
    
    print(response)
```

```python
print(client.list_terminologies())
```

```python
text = 'Sukiyaki is a song by Japanese crooner Kyu Sakamoto, first released in Japan in 1961. The song topped the charts in several countries, including on the Billboard Hot 100 in 1963. The song has grown to become one of the world\'s best-selling singles of all time, having sold over 13 million copies worldwide.'

response = client.translate_text(
    Text=text,
    TerminologyNames=['my_terminology'],
    SourceLanguageCode='en',
    TargetLanguageCode='ja'
)

print(json.dumps(response, ensure_ascii=False, indent=2))
```

### 3.7.2 日本語の音声ファイルを認識

```python
import boto3
import json

client = boto3.client('transcribe', region_name='ap-northeast-1')

response = client.start_transcription_job(
    TranscriptionJobName='＜ジョブ名＞',
    LanguageCode='ja-JP',
    MediaFormat='＜mp3 / mp4 / wav / flacのいずれか＞',
    Media={
	    'MediaFileUri': '＜音声ファイルのオブジェクトURL＞'
    }
)

print(response)
```

```python
response = client.get_transcription_job(
	TranscriptionJobName='＜ジョブ名＞'
)
print(response)
```

```python
import urllib.request

r = urllib.request.urlopen(response['TranscriptionJob']['Transcript']['TranscriptFileUri'])
json_data = json.loads(r.read())
print(json.dumps(json_data, indent=2, ensure_ascii=False))
```

### 3.8.2 日本語テキストを音声に変換

```python
import boto3
import json

client = boto3.client('polly', region_name='ap-northeast-1')

text = 'こんにちは。私はAmazon Pollyのミズキです。'
response = client.start_speech_synthesis_task(
    OutputFormat='＜mp3 / ogg_vorbis / pcmのいずれか＞',
    OutputS3BucketName='＜格納先のS3バケット名＞',
    Text=text,
    VoiceId='Mizuki'
)

print(response)
```

### 3.9.8 チャットボットの公開

```python
import boto3
import json

client = boto3.client('lex-runtime', region_name='us-east-1')

text = 'book a car'

response = client.post_text(
    botName='BookTrip',
    botAlias='Dev',
    userId='user01',
    inputText=text
)

print(response)
```

```python
text = 'New York'

response = client.post_text(
    botName='BookTrip',
    botAlias='Dev',
    userId='user01',
    inputText=text
)

print(response)
```

### 3.11.3 Amazon Personalizeへのデータのインポート（データセットグループの作成）

```json
{
    "Version": "2012-10-17",
    "Id": "PersonalizeS3BucketAccessPolicy",
    "Statement": [
        {
            "Sid": "PersonalizeS3BucketAccessPolicy",
            "Effect": "Allow",
            "Principal": {
	            "Service": "personalize.amazonaws.com"
            },
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::＜バケット名＞",
                "arn:aws:s3:::＜バケット名＞/*"
            ]
        }
    ]
}
```

## 第4章 Amazon SageMaker

### 4.3.3 トレーニングデータの準備

```python
from sklearn.datasets import load_boston
boston = load_boston()

print('data:', boston.data[0])
print('target:', boston.target[0])
print('feature_names:', boston.feature_names)
```

```python
import pandas as pd
df = pd.DataFrame(boston.data, columns=boston.feature_names)
df['PRICE'] = boston.target
df.head()
```

```python
%matplotlib inline
import matplotlib.pyplot as plt

pd.plotting.scatter_matrix(df, figsize=(15,15), range_padding=0.2)
```

### 4.3.4 トレーニングデータの加工

```python
print('boston.data:', boston.data.dtype)
data = boston.data.astype('float32')
print('data:', data.dtype)

print('boston.target:', boston.target.dtype)
target = boston.target.astype('float32')
print('target:', target.dtype)
```

```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(data, target, test_size=0.2)
print(len(X_train), len(X_test))

X_train, X_valid, y_train, y_valid = train_test_split(X_train, y_train, test_size=0.3)
print(len(X_train), len(X_valid))
```

### 4.3.5 ハイパーパラメータの設定とS3へのデータのアップロード

```python
import boto3
import sagemaker
from sagemaker import get_execution_role

role = get_execution_role()
print(role)
```

```python
linear = sagemaker.LinearLearner(
    role,
    train_instance_count=＜インスタンス数 例：1＞,
    train_instance_type='＜インスタンスタイプ 例：ml.m5.large＞',
    output_path='＜モデルを保存するS3バケットとプレフィックス＞',
    predictor_type='regressor',
    epochs=＜エポック数＞,
    early_stopping_patience=＜早期終了しないエポック数＞
)
```

```python
train = linear.record_set(X_train, labels=y_train, channel='train')
validation = linear.record_set(X_valid, labels=y_valid, channel='validation')
test = linear.record_set(X_test, labels=y_test, channel='test')
```

#### COLUMN ローカルPCのJupyter Notebookを使用する場合

```python
!pip install requests==2.20.1
!pip install –upgrade sagemaker
```

```python
import boto3
import sagemaker

role = '＜IAMロールのARN文字列＞'

boto_session = boto3.session.Session(region_name='ap-northeast-1')
sagemaker_session = sagemaker.session.Session(boto_session=boto_session)

linear = sagemaker.LinearLearner(
    role,
    train_instance_count=＜インスタンス数＞,
    train_instance_type='＜インスタンスタイプ＞',
    output_path='＜モデルを保存するS3バケットとプレフィックス＞',
    predictor_type='regressor',
    sagemaker_session=sagemaker_session
)
```

### 4.3.6 トレーニングジョブの作成

```python
linear.fit([train, validation, test], mini_batch_size=10, wait=True, job_name=’＜ジョブ名＞’)
```

### 4.3.11 エンドポイントの動作確認

```python
from sagemaker.predictor import csv_serializer, json_deserializer

predictor = sagemaker.predictor.RealTimePredictor('＜エンドポイント名＞')

predictor.content_type = 'text/csv'
predictor.serializer = csv_serializer
predictor.deserializer = json_deserializer

for i in range(0, 10):
    result = predictor.predict(X_test[i])
    print(result, y_test[i])
```

### 4.3.13 バッチ変換ジョブ

```python
import pandas as pd
import boto3

df = pd.DataFrame(boston.data)
df.to_csv('boston_data.csv', header=False, index=False)

s3 = boto3.resource('s3')
s3.Bucket('＜S3バケット名').Object('boston_data.csv').upload_file('boston_data.csv')
```

```python
import sagemaker

transformer =sagemaker.transformer.Transformer(
    base_transform_job_name='BatchTransformer',
    model_name='＜モデル名＞',
    instance_count=＜インスタンス数　例：1＞,
    instance_type='＜インスタンスタイプ　例：ml.m5.large＞',
    output_path='＜結果を出力するS3バケットとプレフィックス＞'
)

transformer.transform('＜CSVファイルをアップロードしたS3パス＞/boston_data.csv',  content_type='text/csv', split_type='Line')

# バッチ変換ジョブの完了を待つ場合（任意）
transformer.wait()
```

### 4.4.2 線形学習（LinearLearner）

```python
import sagemaker
from sagemaker import get_execution_role
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
data = iris.data.astype('float32')
target = iris.target.astype('float32')

role = get_execution_role()

linear = sagemaker.LinearLearner(
    role,
    train_instance_count=1,
    train_instance_type='ml.m5.large',
    predictor_type='multiclass_classifier', #多値分類のためmulti_classifier
    num_classes=3 # 3種類に分類するため3
)

X_train, X_test, y_train, y_test = train_test_split(data, target, test_size=0.3)
train = linear.record_set(X_train, labels=y_train)
test = linear.record_set(X_test, labels=y_test, channel='test')

linear.fit([train, test], mini_batch_size=10)
```

### 4.4.3 XGBoost

```python
import boto3
import sagemaker
from sagemaker.session import s3_input
from sklearn.datasets import load_boston
from sklearn.model_selection import train_test_split
import pandas as pd

boto_session = boto3.session.Session(region_name='ap-northeast-1')

# データの準備
boston = load_boston()
df = pd.DataFrame(boston.data, columns=boston.feature_names)
df['PRICE'] = boston.target
df = df.iloc[:, [13,0,1,2,3,4,5,6,7,8,9,10,11,12]]

# トレーニングデータと検証データに分割し、CSVファイルを作成
train, valid = train_test_split(df.values, test_size=0.3)
train_df = pd.DataFrame(train)
valid_df = pd.DataFrame(valid)
train_df.to_csv('boston_train.csv', header=False, index=False)
valid_df.to_csv('boston_valid.csv', header=False, index=False)

# トレーニングデータと検証データをS3にアップロード
b = boto_session.resource('s3').Bucket('＜バケット名＞')
b.Object('boston_train.csv').upload_file('boston_train.csv')
b.Object('boston_valid.csv').upload_file('boston_valid.csv')

train = s3_input('s3://＜バケット名＞/boston_train.csv', content_type='text/csv')
valid = s3_input('s3://＜バケット名＞/boston_valid.csv', content_type='text/csv')

# XGBoostインスタンスの作成
container = '501404015308.dkr.ecr.ap-northeast-1.amazonaws.com/xgboost:latest'
xgboost = sagemaker.estimator.Estimator(
    container,
    role,
    1, #インスタンス数
    'ml.m5.large', #インスタンスタイプ
)

# ハイパーパラメータの設定
xgboost.set_hyperparameters(
    objective='reg:linear', # 回帰を行うことを指定
    num_round=25 # トレーニングを実行するラウンド数
)

# トレーニングジョブの作成
xgboost.fit({'train': train, 'validation': valid}) # チャネル名をキーとした辞書型が引数
```

### 4.4.4 主成分分析（PCA）

```python
import sagemaker
from sagemaker import get_execution_role
from sklearn.datasets import load_boston

boston = load_boston()
data = boston.data.astype('float32')

role = get_execution_role()
pca = sagemaker.PCA(
    role,
    train_instance_count=1,
    train_instance_type='ml.m5.large',
    num_components=3,
    algorithm_mode='regular'
)

train = pca.record_set(data)

pca.fit(train, mini_batch_size=10)
```

### 4.4.5 K-Means

```python
import sagemaker
from sklearn.datasets import load_iris

iris = load_iris()
data = iris.data.astype('float32')

role = get_execution_role()
kmeans = sagemaker.KMeans(
    role,
    train_instance_count=1,
    train_instance_type='ml.m5.large',
    k=3, # 分類したいクラス数
)

train = kmeans.record_set(data)

kmeans.fit(train, mini_batch_size=10)
```

### 4.5.2 SageMaker Autopilot

```python
from sklearn.datasets import fetch_california_housing
import pandas as pd

housing = fetch_california_housing()
df = pd.DataFrame(housing.data, columns=housing.feature_names)
df['HouseValue'] = housing.target
df.to_csv('housing.csv', index=False)
```

```python
df.head()
```

## 第5章 AWS Deep Learning AMI

### 5.3.2 TensorFlowとKearsによるモデル構築

```python
import tensorflow as tf
import keras
```

```python
from keras.datasets import cifar10
from keras.utils import np_utils

# データセットのダウンロード
(X_train, y_train), (X_test, y_test) = cifar10.load_data()

# One-Hot形式に変換
y_train = np_utils.to_categorical(y_train)
y_test = np_utils.to_categorical(y_test)

# 標準化
X_train = X_train.astype('float32')
X_test = X_test.astype('float32')
X_train = X_train / 255
X_test = X_test / 255
```

```python
from keras.models import Sequential
from keras.layers import Dense, Activation, Flatten
from keras.layers import Conv2D, MaxPooling2D

model = Sequential()

# 1回目の畳み込みとプーリング
model.add(Conv2D(32, (3, 3), padding='same', input_shape=X_train.shape[1:]))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))

# 2回目の畳み込みとプーリング
model.add(Conv2D(64, (3, 3)))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))

# 全結合層
model.add(Flatten())
model.add(Dense(512))
model.add(Activation('relu'))
model.add(Dense(10))
model.add(Activation('softmax'))

model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
```

```python
model.fit(X_train, y_train, batch_size=32, epochs=10, verbose=1)
```

```python
loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
print('Accuracy', '{:.2f}'.format(accuracy))
```

```python
model.save('cifar10-cnn.h5')
!ls -l
```

### 5.2.4 構築したモデルのデプロイ

```python
from keras.models import load_model
from tensorflow.python.estimator.export import export

keras_model_path = 'cifar10-cnn.h5'
model = load_model(keras_model_path)
estimator = tf.keras.estimator.model_to_estimator(keras_model_path=keras_model_path, model_dir='./')

feature_spec = {'conv2d_1_input': model.input}
serving_input_fn = export.build_raw_serving_input_receiver_fn(feature_spec)
estimator._model_dir = './keras'
estimator.export_savedmodel('cifar10-cnn', serving_input_fn)
```

```python
import grpc
import tensorflow as tf
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2_grpc

channel = grpc.insecure_channel('localhost:9000')
stub = prediction_service_pb2_grpc.PredictionServiceStub(channel)

request = predict_pb2.PredictRequest()
request.model_spec.name = 'cifar10-cnn'
feature = X_test[0].reshape(1, 32, 32, 3)
request.inputs['conv2d_1_input'].CopyFrom(tf.contrib.util.make_tensor_proto(feature))

result = stub.Predict(request, 10.0)
print(result)
```

```python
print(y_test[0])
```