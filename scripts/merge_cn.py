#!/usr/bin/env python3
"""将 "fvtt mod汉化/" 下所有 mod 文件夹里的 cn.json 合并为仓库根目录的一份 cn.json。

每个 mod 文件夹内的 cn.json 保存了该 mod 的翻译条目，其顶层键既可能是
形如 "5edndnpc.name" 的扁平 i18n 键，也可能是形如 "about-face" 的命名空间对象
（Foundry VTT 的 Localization 会自动展平）。本脚本按文件夹名字典序对所有文件做
深度合并，遇到同名键时靠后的文件覆盖靠前的值，保证结果可复现。

用法：在仓库根目录执行 `python scripts/merge_cn.py`，输出根目录 cn.json。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MOD_DIR = ROOT / "fvtt mod汉化"
OUT = ROOT / "cn.json"


def deep_merge(base, extra):
    """把 extra 深度合并进 base，同名标量键由 extra 覆盖。"""
    for key, value in extra.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base


def main():
    files = sorted(MOD_DIR.rglob("cn.json"))
    if not files:
        raise SystemExit(f"未在 {MOD_DIR} 下找到任何 cn.json")

    merged = {}
    for path in files:
        with path.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            raise SystemExit(f"不是 JSON 对象：{path}")
        deep_merge(merged, data)

    # 保留中文（不转义非 ASCII），键排序以保证输出稳定
    with OUT.open("w", encoding="utf-8") as fh:
        json.dump(merged, fh, ensure_ascii=False, indent="\t", sort_keys=True)
        fh.write("\n")

    print(f"已合并 {len(files)} 个文件 -> {OUT}（顶层键 {len(merged)} 个）")


if __name__ == "__main__":
    main()
