const Header = () => (
  <header>
    <div className="flex justify-between items-center">
      <h1>gele-ch</h1>
      <nav>
        <ul>
        <li>
          <a href="/my-calendar">マイカレンダー</a>
        </li>
        <li>
          <a href="/friends">フレンドリスト</a>
        </li>
        <li>
          <a href="/login">ログアウト</a>
        </li>
        </ul>
      </nav>
    </div>
  </header>
);

export default Header;
