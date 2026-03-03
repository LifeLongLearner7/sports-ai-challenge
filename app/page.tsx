export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>🏏 Sports vs AI Challenge</h1>

      <br />

      <a href="/predict">
        <button style={{ padding: 10, marginRight: 10 }}>
          Make Prediction
        </button>
      </a>

      <a href="/leaderboard">
        <button style={{ padding: 10 }}>
          View Leaderboard
        </button>
      </a>
    </div>
  );
}