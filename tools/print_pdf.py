# -*- coding: utf-8 -*-
"""Print HTML to A4-landscape PDF via Chrome DevTools Protocol."""
import base64, json, subprocess, time, os, sys
import requests, websocket

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HTML = "file:///C:/Users/Admin/Desktop/TukDaeng/deliverables/Univerza_Tukdaeng_User_Manual.html"
OUT = r"C:\Users\Admin\Desktop\TukDaeng\deliverables\Univerza_Tukdaeng_User_Manual.pdf"
PORT = 9223

proc = subprocess.Popen([
    CHROME, "--headless=new", f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--user-data-dir=" + os.path.expandvars(r"%TEMP%\chromepdf2"),
    "--disable-gpu", "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

try:
    ws_url = None
    for _ in range(60):
        try:
            tabs = requests.get(f"http://localhost:{PORT}/json").json()
            page = next(t for t in tabs if t["type"] == "page")
            ws_url = page["webSocketDebuggerUrl"]
            break
        except Exception:
            time.sleep(0.5)
    ws = websocket.create_connection(ws_url, timeout=120)
    mid = [0]
    def send(method, params=None):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": method, "params": params or {}}))
        while True:
            msg = json.loads(ws.recv())
            if msg.get("id") == mid[0]:
                return msg.get("result", {})

    send("Page.enable")
    send("Page.navigate", {"url": HTML})
    time.sleep(6)  # let images/fonts load
    for _ in range(20):
        state = send("Runtime.evaluate", {"expression": "document.readyState"}).get("result", {}).get("value")
        imgs = send("Runtime.evaluate", {"expression": "[...document.images].every(i=>i.complete)"}).get("result", {}).get("value")
        if state == "complete" and imgs:
            break
        time.sleep(1)
    time.sleep(2)
    res = send("Page.printToPDF", {
        "paperWidth": 11.69, "paperHeight": 8.27,   # A4 landscape, inches
        "printBackground": True,
        "preferCSSPageSize": False,
        "marginTop": 0, "marginBottom": 0, "marginLeft": 0, "marginRight": 0,
        "displayHeaderFooter": False,
    })
    data = base64.b64decode(res["data"])
    open(OUT, "wb").write(data)
    print(f"Wrote {OUT} — {len(data)/1e6:.1f} MB")
finally:
    proc.terminate()
