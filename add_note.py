#!/usr/bin/env python3
"""
add_note.py — 笔记管理工具
=============================
自动完成 notes-src 目录创建、mkdocs.yml 导航注册、index.html Work 卡片插入。

用法:
  python add_note.py new-course <slug> <显示名> [--en <英文名>] [--desc <描述>] [--tags <标签1,标签2>]
  python add_note.py add-md     <course-slug> <文件名> <标题>
  python add_note.py add-pdf    <course-slug> <PDF路径> <标题>

示例:
  python add_note.py new-course compiler "编译原理" --en "Compilers" --desc "词法·语法·语义·代码生成" --tags "Compiler,PL"
  python add_note.py add-md distributed consensus "共识算法"
  python add_note.py add-pdf os D:/notes/lab1.pdf "实验一：进程调度"
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NOTES_SRC = ROOT / "notes-src"
MKDOCS_YML = ROOT / "mkdocs.yml"
INDEX_HTML = ROOT / "index.html"


# ── 子命令：new-course ──────────────────────────────────────────────

def cmd_new_course(args):
    slug = args.slug
    name = args.name
    en_name = args.en or name
    desc = args.desc or f"{name}课程笔记，浏览器内直接翻阅。"
    tags = [t.strip() for t in args.tags.split(",")] if args.tags else [slug.capitalize()]

    course_dir = NOTES_SRC / slug
    if course_dir.exists():
        print(f"[!] 目录已存在: {course_dir}")
        sys.exit(1)

    # 1) 创建目录 + index.md
    (course_dir / "assets").mkdir(parents=True)
    (course_dir / "index.md").write_text(
        f"# {name}\n\n"
        f"> {en_name}\n\n"
        f"{desc}\n",
        encoding="utf-8",
    )
    print(f"[+] 创建 {course_dir}/index.md")

    # 2) mkdocs.yml — 在「使用说明」之前插入
    _insert_nav_section(slug, name)

    # 3) index.html — 插入 rail-item + work-card
    _insert_homepage_card(slug, name, en_name, desc, tags)

    print()
    print("=" * 50)
    print(f"课程「{name}」已就绪。下一步：")
    print(f"  1. 往 notes-src/{slug}/ 里放 .md 或 PDF")
    print(f"  2. git add . && git commit -m \"notes: 新增 {name}\" && git push")
    print("=" * 50)


# ── 子命令：add-md ──────────────────────────────────────────────────

def cmd_add_md(args):
    slug = args.course
    filename = args.filename.removesuffix(".md")
    title = args.title

    course_dir = NOTES_SRC / slug
    if not course_dir.exists():
        print(f"[!] 课程目录不存在: {course_dir}")
        print(f"    先运行: python add_note.py new-course {slug} \"课程名\"")
        sys.exit(1)

    md_path = course_dir / f"{filename}.md"
    if md_path.exists():
        print(f"[!] 文件已存在: {md_path}")
        sys.exit(1)

    md_path.write_text(f"# {title}\n\n", encoding="utf-8")
    print(f"[+] 创建 {md_path}")

    _append_nav_item(slug, filename, title)

    print()
    print(f"笔记「{title}」已添加。写完内容后：")
    print(f"  git add . && git commit -m \"notes({slug}): {title}\" && git push")


# ── 子命令：add-pdf ─────────────────────────────────────────────────

def cmd_add_pdf(args):
    slug = args.course
    pdf_src = Path(args.pdf_path).resolve()
    title = args.title

    if not pdf_src.exists():
        print(f"[!] PDF 文件不存在: {pdf_src}")
        sys.exit(1)

    course_dir = NOTES_SRC / slug
    if not course_dir.exists():
        print(f"[!] 课程目录不存在: {course_dir}")
        sys.exit(1)

    assets = course_dir / "assets"
    assets.mkdir(exist_ok=True)

    pdf_name = pdf_src.name
    dest = assets / pdf_name
    shutil.copy2(pdf_src, dest)
    print(f"[+] 复制 PDF → {dest}")

    stem = pdf_src.stem
    md_path = course_dir / f"{stem}.md"

    md_path.write_text(
        f"# {title}\n\n"
        f"<iframe\n"
        f'  src="../assets/{pdf_name}#toolbar=1&view=FitH"\n'
        f'  type="application/pdf"\n'
        f'  width="100%"\n'
        f'  height="800"\n'
        f'  loading="lazy"\n'
        f'  style="border:1px solid var(--md-default-fg-color--lightest); border-radius:6px;">\n'
        f"</iframe>\n\n"
        f'!!! tip "如未正常显示"\n'
        f"    部分浏览器不支持内嵌 PDF，请点击下方「新标签页查看」。\n\n"
        f"[:material-open-in-new: 新标签页查看](assets/{pdf_name})"
        f'{{:target="_blank"}} &emsp;\n'
        f"[:material-download: 下载 PDF](assets/{pdf_name})"
        f"{{:download}}\n",
        encoding="utf-8",
    )
    print(f"[+] 创建 {md_path}")

    _append_nav_item(slug, stem, title)

    print()
    print(f"PDF 笔记「{title}」已添加。下一步：")
    print(f"  git add . && git commit -m \"notes({slug}): {title}\" && git push")


# ── mkdocs.yml 操作 ─────────────────────────────────────────────────

def _insert_nav_section(slug: str, name: str):
    """在 nav 的「使用说明」之前插入新课程段。"""
    yml = MKDOCS_YML.read_text(encoding="utf-8")

    anchor = "  - 使用说明:"
    if anchor not in yml:
        anchor = "  - 主页"

    new_block = (
        f"  - {name}:\n"
        f"      - 概览: {slug}/index.md\n"
    )

    yml = yml.replace(anchor, new_block + anchor)
    MKDOCS_YML.write_text(yml, encoding="utf-8")
    print(f"[+] mkdocs.yml 已添加「{name}」导航段")


def _append_nav_item(slug: str, filename: str, title: str):
    """在已有课程导航段末尾追加一条。"""
    yml = MKDOCS_YML.read_text(encoding="utf-8")
    lines = yml.splitlines(keepends=True)

    # 找到包含 slug/ 的最后一行位置
    last_idx = -1
    for i, line in enumerate(lines):
        if f"{slug}/" in line and line.strip().startswith("-"):
            last_idx = i

    if last_idx == -1:
        print(f"[!] mkdocs.yml 中未找到课程 {slug}，请先 new-course")
        sys.exit(1)

    new_line = f"      - {title}: {slug}/{filename}.md\n"
    lines.insert(last_idx + 1, new_line)
    MKDOCS_YML.write_text("".join(lines), encoding="utf-8")
    print(f"[+] mkdocs.yml 已追加「{title}」")


# ── index.html 操作 ─────────────────────────────────────────────────

def _insert_homepage_card(slug: str, name: str, en_name: str, desc: str, tags: list[str]):
    """在 index.html Work 区插入 rail-item 和 work-card。"""
    html = INDEX_HTML.read_text(encoding="utf-8")

    # 当前 notes 数量
    count_match = re.search(
        r'data-cat="notes".*?rail-cat-count">(\d+)',
        html,
        re.DOTALL,
    )
    old_count = int(count_match.group(1)) if count_match else 0
    new_count = old_count + 1
    new_idx = old_count  # 0-based: notes-0, notes-1, ...
    new_no = f"{new_count:02d}"

    # ── 插入 rail-item ──
    rail_marker = "<!-- notes-rail-end -->"
    if rail_marker not in html:
        print("[!] index.html 中缺少 <!-- notes-rail-end --> 标记，请手动添加")
        return

    new_rail = (
        f'                <li class="rail-item" data-id="notes-{new_idx}">'
        f'<span class="rail-node" aria-hidden="true"></span>'
        f'<span class="rail-no">{new_no}</span>'
        f'<span class="rail-name">{name}</span></li>\n'
        f"                "
    )
    html = html.replace(rail_marker, new_rail + rail_marker)

    # ── 插入 work-card ──
    card_marker = "<!-- notes-cards-end -->"
    if card_marker not in html:
        print("[!] index.html 中缺少 <!-- notes-cards-end --> 标记，请手动添加")
        return

    tags_html = "".join(f"<li>{t}</li>" for t in tags)
    new_card = (
        f'          <div class="work-card" data-cat="notes" data-id="notes-{new_idx}">\n'
        f'            <div class="card-index">'
        f'<span class="cur">{new_no}</span>'
        f'<span class="sep">/</span>'
        f'<span class="tot">{new_count}</span></div>\n'
        f'            <h3 class="card-title">{name} · 课内笔记</h3>\n'
        f'            <p class="card-sub">{en_name}</p>\n'
        f'            <p class="card-desc-zh">{desc}</p>\n'
        f'            <ul class="card-tags">{tags_html}</ul>\n'
        f'            <a class="card-link" href="/notes/{slug}/" target="_blank" rel="noopener">'
        f'阅读笔记 <span>↗</span></a>\n'
        f"          </div>\n"
        f"          "
    )
    html = html.replace(card_marker, new_card + card_marker)

    # ── 更新 notes 计数 ──
    html = re.sub(
        r'(data-cat="notes".*?rail-cat-count">)\d+',
        rf"\g<1>{new_count}",
        html,
        count=1,
        flags=re.DOTALL,
    )

    # ── 更新所有 notes 卡片的 tot ──
    def _update_tot(m):
        return m.group(1) + str(new_count) + m.group(3)

    html = re.sub(
        r'(data-cat="notes"[^>]*>.*?<span class="tot">)(\d+)(</span>)',
        _update_tot,
        html,
        flags=re.DOTALL,
    )

    INDEX_HTML.write_text(html, encoding="utf-8")
    print(f"[+] index.html 已添加「{name}」卡片 (notes-{new_idx})")


# ── CLI ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="AM-SuSh 笔记管理工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    # new-course
    p1 = sub.add_parser("new-course", help="创建新课程")
    p1.add_argument("slug", help="目录名 (英文，如 compiler)")
    p1.add_argument("name", help="显示名 (如 编译原理)")
    p1.add_argument("--en", help="英文名 (如 Compilers)")
    p1.add_argument("--desc", help="一句话描述")
    p1.add_argument("--tags", help="标签，逗号分隔 (如 Compiler,PL)")
    p1.set_defaults(func=cmd_new_course)

    # add-md
    p2 = sub.add_parser("add-md", help="添加 Markdown 笔记")
    p2.add_argument("course", help="课程 slug (如 os)")
    p2.add_argument("filename", help="文件名 (不含 .md)")
    p2.add_argument("title", help="标题 (如 进程与线程)")
    p2.set_defaults(func=cmd_add_md)

    # add-pdf
    p3 = sub.add_parser("add-pdf", help="添加 PDF 笔记")
    p3.add_argument("course", help="课程 slug (如 distributed)")
    p3.add_argument("pdf_path", help="PDF 文件路径")
    p3.add_argument("title", help="标题 (如 课程总结)")
    p3.set_defaults(func=cmd_add_pdf)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
