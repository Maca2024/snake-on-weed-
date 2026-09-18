"""Build a minimal static site; never ship the tracked Python environment."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
output = root / 'dist'
output.mkdir(exist_ok=True)
shutil.copy2(root / 'index.html', output / 'index.html')
for directory in ('src', 'assets'):
    shutil.copytree(root / directory, output / directory, dirs_exist_ok=True)
(output / '.nojekyll').write_text('')
print(f'Static site: {output}')
