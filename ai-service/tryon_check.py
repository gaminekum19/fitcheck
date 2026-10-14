"""
Run this once to confirm the try-on Space is reachable and see what it expects:

    python tryon_check.py

If it fails or prints different parameters than tryon.py uses, paste the output
and the code can be adjusted.
"""
from tryon import SPACE, _client

print("Connecting to Space:", SPACE)
client = _client()
print("Connected. API of the Space:\n")
client.view_api()
