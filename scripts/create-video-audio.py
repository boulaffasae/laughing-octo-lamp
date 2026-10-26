"""Generate an original, deterministic 27-second instrumental bed (standard library only)."""
import math
from pathlib import Path
import random
import struct
import wave

rate = 44100
seconds = 27
rng = random.Random(42)
audio = [0.0] * (rate * seconds)

def add(start, duration, voice):
    offset = int(start * rate)
    for i in range(min(int(duration * rate), len(audio) - offset)):
        t = i / rate
        audio[offset + i] += voice(t)

beat = 60 / 112
for step in range(int(seconds / beat)):
    at = step * beat
    add(at, .24, lambda t: .48 * math.sin(2 * math.pi * (48 * t + 9 * (1 - math.exp(-25 * t)))) * math.exp(-18 * t))
    if step % 2:
        add(at, .13, lambda t: rng.uniform(-.15, .15) * math.exp(-32 * t))
    for sub in (0, .5):
        add(at + beat * sub, .045, lambda t: rng.uniform(-.055, .055) * math.exp(-90 * t))
    root = [130.81, 164.81, 110.0, 146.83][(step // 4) % 4]
    add(at, .38, lambda t, hz=root: .12 * math.sin(2 * math.pi * hz * t) * math.exp(-9 * t))
    if step % 2 == 0:
        hz = root * [4, 5, 6, 5][(step // 2) % 4]
        add(at + beat * .5, .65, lambda t, hz=hz: .075 * (math.sin(2 * math.pi * hz * t) + .3 * math.sin(4 * math.pi * hz * t)) * math.exp(-7 * t))

path = Path(__file__).resolve().parents[1] / 'public/video/louma-beat.wav'
path.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(path), 'wb') as out:
    out.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    out.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * min(1, i / rate / .3, (len(audio)-i) / rate / 1.2) * 28000)) for i, v in enumerate(audio)))
print(path)
