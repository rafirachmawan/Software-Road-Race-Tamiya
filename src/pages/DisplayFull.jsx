export default function DisplayFull() {
  return (
    <div style={styles.container}>
      <h1>🏁 ROAD RACE EVENT</h1>
      <h2>RONDE 1</h2>

      <div style={styles.grid}>
        <div style={styles.card}>JALUR 1</div>
        <div style={styles.card}>JALUR 2</div>
        <div style={styles.card}>JALUR 3</div>
        <div style={styles.card}>JALUR 4</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#0f172a",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 400px)",
    gap: "30px",
    marginTop: "50px",
  },
  card: {
    background: "#1e293b",
    padding: "60px",
    borderRadius: "20px",
    textAlign: "center",
    fontSize: "30px",
  },
};
