---
title: 「初めてのWatson 改訂版」コードリスト（Python SDK版）
date: 2020-05-10
---

書籍「初めてのWatson 改訂版～APIの用例と実践プログラミング」（井上研一＝著、リックテレコム＝刊）のコードリストをPython SDKを使用する形に変換したものです。  
[出版社によるサポートサイト](http://www.ric.co.jp/book/contents/book_1128.html)  
[Amazon.co.jpで購入](https://amzn.to/2ziUROV)

2020年5月版です。

## Python SDKのインストール

```python
!pip install --upgrade ibm-watson
```

[IBM Watson Python SDK GitHub](https://github.com/watson-developer-cloud/python-sdk)

## Chapter 4.3 Natural Language Classifier

### NLC分類器の作成

```python
from ibm_watson import NaturalLanguageClassifierV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json

nlc = NaturalLanguageClassifierV1(
    authenticator=IAMAuthenticator('{apikey}')
)

# ダラス以外のリージョンを指定する場合(例は東京リージョン)
# nlc.set_service_url('https://api.jp-tok.natural-language-classifier.watson.cloud.ibm.com')

with open('trainingdata.csv', 'rb') as training_data:
    classifier = nlc.create_classifier(
        training_data=training_data,
        training_metadata='{"name": "My Classifier","language": "ja"}'
    ).get_result()
print(json.dumps(classifier, indent=2))
```

### NLC分類器の学習状況の取得

```python
nlc.get_classifier('{classifier_id}').get_result()
```

### NLC分類器のテスト

```python
classes = nlc.classify(
    '{classifier_id}',
    'お酒を飲みたい').get_result()
print(json.dumps(classes, indent=2, ensure_ascii=False))
```

## Chapter 4.4 Natural Language Understanding

### NLUでのWebサイトからのキーワードなどの抽出

```python
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from ibm_watson.natural_language_understanding_v1 import Features, EntitiesOptions, KeywordsOptions
import json

nlu = NaturalLanguageUnderstandingV1(
    version='2019-07-12',
    authenticator=IAMAuthenticator('{apikey}')
)

# ダラス以外のリージョンを指定する場合(例は東京リージョン)
# nlu.set_service_url('https://api.jp-tok.natural-language-understanding.watson.cloud.ibm.com')

response = nlu.analyze(
    url='https://inoccu.com/profile/',
    features=Features(
        entities=EntitiesOptions(emotion=True, sentiment=True),
        keywords=KeywordsOptions(emotion=True, sentiment=True)
    ),
    language='ja'
).get_result()
print(json.dumps(response, indent=2, ensure_ascii=False))
```

## Chapter 4.5 Discovery

### 環境の作成

```python
from ibm_watson import DiscoveryV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json

discovery = DiscoveryV1(
    version='2019-07-12',
    authenticator=IAMAuthenticator('{apikey}')
)

# ダラス以外のリージョンを指定する場合(例は東京リージョン)
# discovery.set_service_url('https://api.jp-tok.discovery.watson.cloud.ibm.com')

environment = discovery.create_environment(name='My Environment', size='LT').get_result()
print(json.dumps(environment, indent=2, ensure_ascii=False))
```

### 環境情報の取得

```python
discovery.get_environment('{environment_id}').get_result()
```

### コレクションの作成

まず、configurationを取得する。environemntにはデフォルトのconfigurationが存在するため、それを使用できる。

```python
discovery.list_configurations('{environment_id}').get_result()
```

次にコレクションを作成する。

```python
collection = discovery.create_collection(
    environment_id='{environment_id}',
    configuration_id='{configuration_id}',
    name='My Collection',
    language='ja'
).get_result()
print(json.dumps(collection, indent=2, ensure_ascii=False))
```

### 文書の追加

```python
with open('place-1.json') as f:
    result = discovery.add_document(
        '{environment_id}',
        '{collection_id}',
        file=f
    ).get_result()
print(json.dumps(result, indent=2, ensure_ascii=False))
```

### コレクション情報の取得

```python
discovery.get_collection(
    '{environment_id}',
    '{collection_id}'
).get_result()
```

### 自然言語による検索

```python
response = discovery.query(
    '{environment_id}',
    '{collection_id}',
    natural_language_query='新宿の名所'
).get_result()
print(json.dumps(response, indent=2, ensure_ascii=False))
```

### Discovery Query Language（DQL）による検索

```python
response = discovery.query(
    '{environment_id}',
    '{collection_id}',
    query='enriched_text.entities.text::"北村銀太郎"'
).get_result()
print(json.dumps(response, indent=2, ensure_ascii=False))
```

### 訓練データの追加

```python
from ibm_watson.discovery_v1 import TrainingExample

response = discovery.add_training_data(
    '{environment_id}',
    '{collection_id}',
    natural_language_query='落語の寄席を教えて',
    examples=[
        TrainingExample(document_id='{document_id}', relevance=10)
    ]
).get_result()
print(json.dumps(response, indent=2, ensure_ascii=False))
```

## Chapter 4.7 Speech To TextとText To Speech

### 音声ファイルを文字列に変換

```python
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json

stt = SpeechToTextV1(
    authenticator=IAMAuthenticator('{apikey}')
)

# ダラス以外のリージョンを指定する場合(例は東京リージョン)
# stt.set_service_url('https://api.jp-tok.speech-to-text.watson.cloud.ibm.com')

with open('recoding.flac', 'rb') as f:
    response = stt.recognize(
        audio=f,
        content_type='audio/flac',
        model='ja-JP_BroadbandModel',
        word_alternatives_threshold=0.9
    ).get_result()
print(json.dumps(response, indent=2, ensure_ascii=False))
```

### 文字列を音声ファイルに変換

```python
from ibm_watson import TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json

tts = TextToSpeechV1(
    authenticator=IAMAuthenticator('{apikey}')
)

# ダラス以外のリージョンを指定する場合(例は東京リージョン)
# tts.set_service_url('https://api.jp-tok.text-to-speech.watson.cloud.ibm.com')

with open('speech.flac', 'wb') as f:
    f.write(
        tts.synthesize(
            '寿限無寿限無',
            accept='audio/flac',
            voice='ja-JP_EmiVoice'
        ).get_result().content
    )
```

## Chapter 4.8 Visual Recognition

### 独自の分類器を作成

```python
from ibm_watson import VisualRecognitionV3
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json

vr = VisualRecognitionV3(
    version='2018-03-19',
    authenticator=IAMAuthenticator('{apikey}')
)

with open('dogs.zip', 'rb') as dogs:
    with open('cats.zip', 'rb') as cats:
        model = vr.create_classifier(
            'dog-cat',
            positive_examples={
                'dog': dogs,
                'cat': cats
            }
        ).get_result()
print(json.dumps(model, indent=2, ensure_ascii=False))
```

### 独自の分類器の学習状況の取得

```python
vr.get_classifier('{classifier_id}').get_result()
```

### 独自の分類器を使用した分類

```python
with open('cat.jpg', 'rb') as f:
    response = vr.classify(
        images_file=f,
        threshold=0.6,
        classifier_ids=['{classifier_id}'],
        owners=['me']
    ).get_result()
print(json.dumps(response, indent=2, ensure_ascii=False))
```

