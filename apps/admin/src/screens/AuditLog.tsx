import { useEffect, useState } from "react";
import { fetchAuditLogs, type AuditLog as AuditLogRecord } from "../services/adminRepository";

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAuditLogs().then(setLogs).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "审计日志读取失败"));
  }, []);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>审计日志</h2>
        <span>{logs.length} actions</span>
      </div>
      {message ? <p className="status">{message}</p> : null}
      <div className="table">
        {logs.map((log) => (
          <article className="row-card" key={log.id}>
            <strong>{log.action}</strong>
            <span>{log.target_type}: {log.target_id ?? "-"}</span>
            <small>{new Date(log.created_at).toLocaleString("zh-CN")}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
