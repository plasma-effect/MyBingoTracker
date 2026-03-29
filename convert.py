import csv
import json
import sys
import os

def convert_csv_to_json(input_file, output_file):
    data_list = []
    
    if not os.path.exists(input_file):
        print(f"エラー: {input_file} が見つかりません。")
        sys.exit(1)

    try:
        with open(input_file, mode='r', encoding='utf-8') as f:
            # カンマ区切り、余計な空白をトリムすることを想定
            reader = csv.reader(f)
            
            for line_num, row in enumerate(reader, start=1):
                # 空行をスキップ
                if not row:
                    continue
                
                # 要素数が足りない場合のチェック
                if len(row) < 5:
                    print(f"エラー: {line_num}行目の要素数が不足しています。")
                    sys.exit(1)
                
                # 各カラムの抽出（前後の空白を削除）
                category = row[0].strip()
                name = row[1].strip()
                priority_str = row[2].strip()
                place = row[3].strip()
                memo = row[4].strip()

                # バリデーション: カテゴリー名と名前の空チェック
                if not category or not name:
                    print(f"エラー: {line_num}行目のカテゴリー名または名前が空です。")
                    sys.exit(1)

                # バリデーション: 優先度の数値チェック (0, 1, 2, 3, 4)
                try:
                    priority = int(priority_str)
                    if priority not in [0, 1, 2, 3, 4]:
                        raise ValueError
                except ValueError:
                    print(f"エラー: {line_num}行目の優先度 '{priority_str}' が不正です。0-4の数値を指定してください。")
                    sys.exit(1)

                # 辞書形式でリストに追加
                data_list.append({
                    "name": name,
                    "category": category,
                    "priority": priority,
                    "place": place,
                    "memo": memo
                })

        # JSONファイルとして出力
        with open(output_file, mode='w', encoding='utf-8') as f:
            json.dump(data_list, f, ensure_ascii=False, indent=2)
            
        print(f"正常に変換されました: {output_file} ({len(data_list)}件)")

    except Exception as e:
        print(f"予期せぬエラーが発生しました: {e}")
        sys.exit(1)

if __name__ == "__main__":
    convert_csv_to_json('data.csv', 'data.json')
