動画同時アップロードを複数本できないようにする
サインアップ後にユーザー登録をする画面に遷移→書道でエラーが出る

ffmpegwasmやってみる
遅かった

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