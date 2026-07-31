import { useState } from "react";
import { AuditLog } from "./screens/AuditLog";
import { HubsReview } from "./screens/HubsReview";
import { ListingsReview } from "./screens/ListingsReview";
import { ReportsReview } from "./screens/ReportsReview";
import { UsersAdmin } from "./screens/UsersAdmin";
import "./styles.css";

type AdminTab = "listings" | "reports" | "hubs" | "users" | "audit";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "listings", label: "商品审核" },
  { id: "reports", label: "举报处理" },
  { id: "hubs", label: "据点入驻" },
  { id: "users", label: "用户管理" },
  { id: "audit", label: "审计日志" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>("listings");

  return (
    <main className="admin-shell">
      <header className="topbar">
        <div>
          <h1>VeloHive Admin</h1>
          <p>审核商品、举报、据点和用户状态</p>
        </div>
        <span className="badge">store ready beta</span>
      </header>
      <nav className="tabs" aria-label="后台模块">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "active" : ""}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === "listings" ? <ListingsReview /> : null}
      {activeTab === "reports" ? <ReportsReview /> : null}
      {activeTab === "hubs" ? <HubsReview /> : null}
      {activeTab === "users" ? <UsersAdmin /> : null}
      {activeTab === "audit" ? <AuditLog /> : null}
    </main>
  );
}
