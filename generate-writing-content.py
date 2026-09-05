import json
from pathlib import Path


root = Path(__file__).resolve().parent
writings_directory = root / "writings"
output_path = root / "config" / "generated" / "writing-content.js"
markdown_files = sorted(writings_directory.glob("*.md"))

content = {
    f"writings/{markdown_file.name}": markdown_file.read_text(encoding="utf-8")
    for markdown_file in markdown_files
}
serialized = json.dumps(content, ensure_ascii=False, indent=2)
serialized = serialized.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")

output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(
    "// Generated from writings/*.md. Run python3 generate-writing-content.py "
    "after editing.\n"
    f"window.WRITING_CONTENT = Object.freeze({serialized});\n",
    encoding="utf-8",
)

print(
    f"Bundled {len(markdown_files)} Markdown files into "
    "config/generated/writing-content.js."
)
