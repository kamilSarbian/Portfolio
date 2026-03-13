import { useTranslation } from "react-i18next";

export default function AuthStatus({ token, user }) {
  const { t } = useTranslation();

  const isLogged = !!token;
  const role = user?.role || null;

  return (
    <div
      className="result"
      style={{
        marginTop: 0,
        padding: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: isLogged ? "#22c55e" : "var(--border)",
            flex: "0 0 auto",
          }}
        />

        <div>
          <div style={{ fontWeight: 900, color: "var(--fg)" }}>
            {isLogged
              ? t("auth.statusLogged") || "Authenticated"
              : t("auth.statusGuest") || "Not authenticated"}
          </div>

          <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>
            {isLogged
              ? role === "admin"
                ? t("auth.statusAdmin") || "Current role: admin"
                : t("auth.statusUser") || "Current role: user"
              : t("auth.statusHint") || "Login to access protected endpoints."}
          </div>
        </div>
      </div>

      {user?.email ? (
        <div
          style={{
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 14,
            wordBreak: "break-word",
          }}
        >
          {user.email}
        </div>
      ) : null}
    </div>
  );
}