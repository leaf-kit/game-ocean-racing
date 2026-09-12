#!/bin/sh
# index.html 이 있는 폴더에서 캐시 없는 개발 서버를 띄운다.
cd "$(dirname "$0")" || exit 1
exec python3 serve.py 8000
