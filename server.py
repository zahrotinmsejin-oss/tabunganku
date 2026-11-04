import http.server
import socketserver
import socket
import webbrowser
import os
import sys

PORT = 8888

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_server():
    # Pastikan direktori kerja berada di folder file ini
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    local_ip = get_local_ip()
    url_laptop = f"http://localhost:{PORT}"
    url_hp = f"http://{local_ip}:{PORT}"

    print("=" * 60)
    print("   💰 APLIKASI TABUNGANKU BERHASIL DIJALANKAN! 💰")
    print("=" * 60)
    print(f"\n💻 Buka di Laptop / PC : {url_laptop}")
    print(f"📱 Buka di HP (Smartphone) : {url_hp}")
    print("\nPetunjuk untuk HP:")
    print("1. Pastikan HP dan Laptop terhubung ke jaringan Wi-Fi yang sama.")
    print(f"2. Buka browser di HP (Chrome / Safari) lalu ketik: {url_hp}")
    print("3. Di HP, pilih 'Tambahkan ke Layar Utama' agar jadi aplikasi.")
    print("\nTekan Ctrl + C di terminal ini jika ingin menghentikan server.")
    print("=" * 60 + "\n")

    # Buka browser laptop otomatis
    try:
        webbrowser.open(url_laptop)
    except Exception:
        pass

    Handler = http.server.SimpleHTTPRequestHandler
    Handler.extensions_map.update({
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml'
    })

    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
            sys.exit(0)

if __name__ == "__main__":
    run_server()
