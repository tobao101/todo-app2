# Todo App

Next.js で作ったシンプルでオシャレなTodoアプリです。

## 機能

- ✅ タスクの追加
- ✅ タスクの完了チェック
- ✅ タスクの削除

タスクはブラウザの localStorage に保存されるため、リロードしても消えません。

## ローカルでの起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## Vercel へのデプロイ

1. このプロジェクトを GitHub などのリポジトリに push します。
2. [Vercel](https://vercel.com/) にログインし、「Add New... → Project」からリポジトリをインポートします。
3. フレームワークは自動で **Next.js** と認識されます。設定はそのままで「Deploy」を押すだけで公開できます。

または Vercel CLI でもデプロイできます。

```bash
npm i -g vercel
vercel
```

## 技術構成

- [Next.js 15](https://nextjs.org/)（App Router）
- React 19
- TypeScript
- CSS（追加ライブラリなし）
