---
title: Python 3 + Selenium 4で自動検索を実行、GitHub Actionsで簡単にスケジュール化
tags:
  - meilisearch
  - python
date: 2023-06-06
lastmod: 2023-06-06
draft: false
---

今回は、GitHub ActionsでPython 3 + Selenium 4を使って自動検索を定期的に実行する方法を紹介します。

高速検索エンジンの[Meilisearch Cloud](https://www.meilisearch.com/)は、無料枠の場合、3日間の稼働実績がないとプロジェクト削除を予告するメールが届きます（※）。小規模サイトの場合、せっかく実装した検索機能があまり使われない場合もあるため、定期的に自動検索を行えればプロジェクトを維持できます。

※警告メールが届いても58時間以内に検索かインデックス更新をすればいいので、実際の必要最低限の稼働間隔は、3日間 + 58時間 = 130時間（5.42日）に1回となります。

動作環境:

- Python 3.11
- Selenium 4
- undetected-chromedriver

## 概要

フォルダー構成は以下の通り。

```tree
root
├─ .github/
|  └─ workflows/
|     └─ run.yml
├─ search.py
└─ requirements.txt
```

### ワークフローの概要

稼働中サイトの検索窓の`id`要素を、あらかじめ`id="searchInput"`としておきます。

- (1 + 3n)日の日本時間午前0時に実行
- Seleniumで検索窓に「あ」と入力したら終了
- 依存関係はrequirements.txtに記載

### Pythonファイルのポイント

- サーバーのアンチ・ボット対策に[undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver)を利用

## コード

<div class="filename">.github/workflows/run.yml</div>

```yml
name: Run Python script on schedule
on:
  schedule:
    - cron: "0 15 1,4,7,10,13,16,19,22,25,28,31 * *"
  # workflow_dispatch: 手動で動かしたい場合は追加

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Set up Python environment
        uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - name: Cache pip dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Python script
        run: python search.py
```

<div class="filename">search.py</div>

```py
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = uc.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--headless')
# ドライバーのバージョン指定
driver = uc.Chrome(options=options, version_main=113)

# 要素が見つからない場合は5秒待機
driver.implicitly_wait(5)
# 要素が有効になるまで5秒待機
wait = WebDriverWait(driver, 5)

# 検索したいサイト
driver.get("https://example.com/")

# 検索窓 id="searchInput"を取得し、「あ」を入力
input_element = wait.until(EC.presence_of_element_located((By.ID, "searchInput")))
input_element.send_keys("あ")
time.sleep(3)

# webdriverの終了
driver.quit()
```

<div class="filename">requirements.txt</div>

```txt
selenium
undetected-chromedriver
```

## コードの解説

### ドライバーのバージョン指定

数日動かしてみましたが、`undetected-chromedriver`は最新のベータ版まで対応しており、立ち上がるブラウザーのバージョンと合わないことがありました。

そのため、エラーが出た場合はエラー内容を確認してバージョンを指定しています。

私がPythonとGitHub Actionsに完全に精通しているとは言えないので、`undetected-chromedriver`とブラウザーのバージョンを自動で合わせる方法があれば教えてください😅

### アンチ・ボット対策

運用サーバーによっては、ボットアクセスがサーバーのWAF（ファイアーウォール）で弾かれる場合があるため、先述した[undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver)を活用しています。これがないと、少なくともCloudfareには弾かれました。

### 稼働間隔

Meilisearch用に利用する場合、警告メールが来てもまだ58時間の猶予はありますが、メールが来るのが面倒なので、稼働日は`(1 + 3n)`日毎に設定しています。

プライベートリポジトリの場合、GitHub Actionsの無料枠は月2000分です（2023年6月初旬現在）。このコードの実行時間は30秒程度で、最大で月5分程度の消費となります。

リンク [GitHub Actions の課金について - GitHub Docs](https://docs.github.com/ja/billing/managing-billing-for-github-actions/about-billing-for-github-actions)

実行時間節約のため上記コードには依存関係のキャッシュ用コードも追加してはいますが、キャッシュなしでは8秒程度の依存関係インストールが、4秒程度になるのみです。

GitHub Actions実行時間をさらに節約したい場合は、cronの実行日の間隔を空けたりするなど対応してください。
