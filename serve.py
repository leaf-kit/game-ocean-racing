#!/usr/bin/env python3
"""개발용 정적 서버.
- 브라우저가 옛 파일을 캐시하지 않도록 Cache-Control: no-store 를 붙인다.
- 오디오/비디오 재생을 위해 HTTP Range 요청(206 Partial Content)을 지원한다.
"""
import os, sys, re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))  # 항상 index.html 이 있는 폴더에서 서비스


class Handler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        # Range 요청이면 해당 구간만 206으로 응답 (Chrome 미디어 로더가 필요로 함)
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if rng and os.path.isfile(path):
            m = re.match(r'bytes=(\d*)-(\d*)', rng)
            if m:
                size = os.path.getsize(path)
                start = int(m.group(1)) if m.group(1) else max(0, size - int(m.group(2)))
                end = int(m.group(2)) if m.group(1) and m.group(2) else size - 1
                end = min(end, size - 1)
                if start > end or start >= size:
                    self.send_response(416); self.send_header('Content-Range', f'bytes */{size}'); self.end_headers(); return None
                f = open(path, 'rb'); f.seek(start)
                self.send_response(206)
                self.send_header('Content-Type', self.guess_type(path))
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length', str(end - start + 1))
                self.end_headers()
                self._range_len = end - start + 1
                return f
        self._range_len = None
        return super().send_head()

    def copyfile(self, source, outputfile):
        n = getattr(self, '_range_len', None)
        if n is None:
            return super().copyfile(source, outputfile)
        remaining = n
        while remaining > 0:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            outputfile.write(chunk); remaining -= len(chunk)

    def log_message(self, fmt, *args):  # 조용히
        pass


if __name__ == '__main__':
    print(f'http://localhost:{PORT} 에서 접속하세요 (종료: Ctrl+C)')
    ThreadingHTTPServer(('', PORT), Handler).serve_forever()
