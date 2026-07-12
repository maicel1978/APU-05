import http.server
import socketserver
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Habilitar COOP y COEP para permitir SharedArrayBuffer si se requiere en el futuro
        # Aunque R2 prefiere no depender de esto, es bueno para rigor de red local.
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

print(f"--- APU-05 SERVIDOR DE DESARROLLO ---")
print(f"Local: http://localhost:{PORT}")
print(f"Tests: http://localhost:{PORT}/tests/runner.html")
print(f"------------------------------------")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
