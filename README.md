## to do
- 動画サイズ制限の適切な値を決定
- サインアップ後の挙動確認、ユーザー登録をする画面に遷移
- チーム機能について、ライングループみたいに招待する形にリファクタリングするかも
- 仕分けの動作確認

ffmpegwasm - 処理速度遅い
cloudinary - 欲しい機能が足りない

ffmpegだとサーバーレスで動かない

webはec2、モバイルからmtsアップロードはなさそうだからモバイルはffmpegいらない

開発環境
docker build --no-cache -t gele-docker .
docker run -d -p 3000:3000 gele-docker
docker ps
docker stop e96aaa3ca4cf
docker logs -f e96aaa3ca4cf
docker exec -it e96aaa3ca4cf sh
docker rm e96aaa3ca4cf

next
cron_jobs

-- siwake_storageバケットの2日以上経過したフォルダを削除するジョブをスケジュール
SELECT cron.schedule('0 2 * * *', $$
  WITH old_folders AS (
    SELECT DISTINCT
      SUBSTRING(name FROM '^[^/]+') AS folder_name,
      MAX(created_at) AS last_modified
    FROM storage.objects
    WHERE bucket_id = 'siwake_storage'
      AND position('/' in name) > 0
    GROUP BY SUBSTRING(name FROM '^[^/]+')
    HAVING MAX(created_at) < NOW() - INTERVAL '2 days'
  )
  DELETE FROM storage.objects
  WHERE bucket_id = 'siwake_storage'
    AND SUBSTRING(name FROM '^[^/]+') IN (SELECT folder_name FROM old_folders);
$$);

-- オプション：削除されたフォルダの数とファイル数をログに記録
SELECT cron.schedule('5 2 * * *', $$
  WITH deleted_info AS (
    SELECT COUNT(DISTINCT SUBSTRING(name FROM '^[^/]+')) AS folders_count,
           COUNT(*) AS files_count
    FROM storage.objects
    WHERE bucket_id = 'siwake_storage'
      AND created_at < NOW() - INTERVAL '2 days'
      AND position('/' in name) > 0
  )
  INSERT INTO logs (message, created_at)
  SELECT 'Deleted ' || folders_count || ' old folders containing ' || files_count || ' files from siwake_storage', NOW()
  FROM deleted_info;
$$);

## フレンド機能の実装について

### データ構造
フレンドとチームの管理には、Zustandを使用したグローバルステート管理を実装しています。

#### 主要なデータ型
- `FriendData`: フレンド情報
- `Team`: チーム情報
- `TeamMember`: チームメンバー情報

### キャッシュ管理
- キャッシュ期間: 5分
- `lastFetched`タイムスタンプを使用して不要な再取得を防止
- ユーザー体験の向上��サーバー負荷の軽減を実現

### データフロー
1. フレンドデータの取得
   - フレンドリストの取得（送信/受信の両方）
   - アバター画像のダウンロードと一時URL生成
   - ステータス管理（pending/accepted）

2. チームデータの取得
   - チームメンバーシップの取得
   - チーム情報の取得
   - メンバーのプロファイル情報の取得

### 最適化ポイント
- データのプリフェッチ
  - コンポーネントマウント時に事前取得
  - ホバー時の遅延を最小化

- エラーハンドリング
  - 画像取得エラーの適切な処理
  - データ取得エラーのグレースフルフェイルバック

### 型安全性
- 厳密な型定義による安全性確保
- Supabaseクエリの戻り値に対する型チェック
- nullチェックの徹底

### 使用例
```typescript
// フレンドデータの取得
const { friends, teams, isLoading } = useFriendsStore();

// データの更新
await fetchFriendsAndTeams(userId);

// ストアのクリア
clearStore();
```

### 注意点
- アバター画像のURLは一時的なものであり、ページリロード時に再生成が必要
- キャッシュ期間（5分）は必要に応じて調整可能
- チームメンバーの変更はリアルタイムには反映されない（再取得が必要）

### 今後の改善点
- WebSocketを使用したリアルタイム更新の実装
- キャッシュ戦略の最適化
- 画像のプリロード機能の追加
