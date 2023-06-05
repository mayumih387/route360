---
title: How to Automate Search with Python 3 + Selenium 4 via GitHub Actions
tags:
  - meilisearch
  - python
date: 2023-06-06
lastmod: 2023-06-06
draft: false
---

This post is about how to automate search actions with Python 3 + Selenium 4 on GitHub Actions.

If you are using [Meilisearch Cloud](https://www.meilisearch.com/) with its free plan, you will receive an email notification of project deletion after 3 days of inactivity(\*). It's possible that the search system on your website is not used that often. An automate search must be useful to prevent the project from being deleted.

\*You still have 58 hours after receiving the warning email. The actual minimum required operating interval should be 1 time per 3 days + 58 hours = 130 hours (5.42 days).

Environment:

- Python 3.11
- Selenium 4
- undetected-chromedriver

## Overview

The folder structure is as follows;

```tree
root
├─ .github/
|  └─ workflows/
|     └─ run.yml
├─ search.py
└─ requirements.txt
```

### Workflow Overview

Set the input element `id` as `id="searchInput"`.

- Run on (1 + 3n)th day at 0:00 UTC
- Exit the program after entering "a" in the search input element
- Describe dependencies to requirements.txt

### Python program itself

- Use [undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) to avoid the server's WAF anti-bot.

## Code

<div class="filename">.github/workflows/run.yml</div>

```yml
name: Run Python script on schedule
on:
  schedule:
    - cron: "0 15 1,4,7,10,13,16,19,22,25,28,31 * *"
  # workflow_dispatch: <- Add it for manual execution

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
# specify driver version
driver = uc.Chrome(options=options, version_main=113)

# If element not found, wait 5 seconds
driver.implicitly_wait(5)
# Wait 5 seconds for element to take effect
wait = WebDriverWait(driver, 5)

# The site to search
driver.get("https://example.com/")

# Get id="searchInput" and input "a"
input_element = wait.until(EC.presence_of_element_located((By.ID, "searchInput")))
input_element.send_keys("a")
time.sleep(3)

# Close webdriver
driver.quit()
```

<div class="filename">requirements.txt</div>

```txt
selenium
undetected-chromedriver
```

## Code Description

### Driver version

I have been testing this code on GitHub Actions, and I get errors about the difference in versions between the driver and the browser, especially when the browser is recently updated. Or it could be because `undetected-chromedriver` is running with the latest beta.

So I have specified the driver version when I get an error.

Since I'm not completely familiar with Python and GitHub Actions, I'd appreciate if someone could provide me with a way to automatically reconcile the two versions😅

### Anti-Bot Measures

The server you are using may protect bot access with its WAF. To prevent this, I added [undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) as mentioned above. Without it, Cloudflare rejected this program.

### Operation Interval

If you use this program for Meilisearch Cloud free plan, you still have 58 hours after a warning email. In this program, I run it on `(1 + 3n)`th day because I don't want to receive their email.

GitHub Actions offers 2,000 minutes of free usage per month for private repositories (as of June 2023). This program takes about 30 seconds to run, which would be a total of 5 minutes per month.

Link [About billing for GitHub Actions - GitHub Docs](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)

I added lines to cache the dependencies, but it only saves a few seconds.

If you want to save execution time, reduce the date or wait time.
