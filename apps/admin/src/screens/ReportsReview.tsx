import { useEffect, useState } from "react";
import { fetchOpenReports, resolveReport, type OpenReport } from "../services/adminRepository";

export function ReportsReview() {
  const [reports, setReports] = useState<OpenReport[]>([]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOpenReports().then(setReports).catch((error: unknown) => setMessage(readError(error)));
  }, []);

  const decide = async (reportId: string, status: "resolved" | "rejected") => {
    try {
      await resolveReport(reportId, note || "已处理", status);
      setReports((current) => current.filter((report) => report.id !== reportId));
      setMessage("举报已处理");
    } catch (error) {
      setMessage(readError(error));
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>举报处理</h2>
        <span>{reports.length} open</span>
      </div>
      <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="处理说明" />
      {message ? <p className="status">{message}</p> : null}
      <div className="table">
        {reports.map((report) => (
          <article className="row-card" key={report.id}>
            <strong>{report.reason}</strong>
            <span>{report.target_type}: {report.target_id}</span>
            <p>{report.details || "无补充说明"}</p>
            <button onClick={() => decide(report.id, "resolved")}>解决</button>
            <button className="danger" onClick={() => decide(report.id, "rejected")}>驳回</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败";
}
