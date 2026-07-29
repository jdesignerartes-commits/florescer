// Forma de folha em CSS puro (sem emoji, sem fonte externa) — ImageResponse
// roda num runtime que não tem acesso de rede confiável nesse ambiente, e
// emoji/fontes exigem buscar glifos fora. Duas folhas com o truque clássico
// de border-radius assimétrico + rotate.
export function iconMark(size: number, cornerRatio = 0.22) {
  const leaf = Math.round(size * 0.46);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#B56E4A",
        borderRadius: Math.round(size * cornerRatio),
      }}
    >
      <div style={{ display: "flex", transform: `rotate(45deg)` }}>
        <div
          style={{
            width: leaf,
            height: leaf,
            background: "#8A8B65",
            borderRadius: "0% 100% 0% 100%",
            display: "flex",
          }}
        />
        <div
          style={{
            width: leaf,
            height: leaf,
            background: "#F7F1E8",
            borderRadius: "100% 0% 100% 0%",
            display: "flex",
          }}
        />
      </div>
    </div>
  );
}
