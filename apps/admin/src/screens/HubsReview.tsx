import { useEffect, useState } from "react";
import { approveHub, fetchPendingHubs, rejectHub, type PendingHub } from "../services/adminRepository";

export function HubsReview() {
  const [hubs, setHubs] = useState<PendingHub[]>([]);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingHubs().then(setHubs).catch((error: unknown) => setMessage(readError(error)));
  }, []);

  const decide = async (hubId: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await approveHub(hubId);
      } else {
        await rejectHub(hubId, reason || "资料不完整");
      }
      setHubs((current) => current.filter((hub) => hub.id !== hubId));
      setMessage("据点申请已处理");
    } catch (error) {
      setMessage(readError(error));
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>据点入驻</h2>
        <span>{hubs.length} pending</span>
      </div>
      <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="拒绝原因" />
      {message ? <p className="status">{message}</p> : null}
      <div className="grid">
        {hubs.map((hub) => (
          <article className="card" key={hub.id}>
            <h3>{hub.name}</h3>
            <p>{hub.address}</p>
            <p>{hub.facility_tags.join(" · ")}</p>
            <p>{hub.contact_method}</p>
            <div className="actions">
              <button onClick={() => decide(hub.id, "approve")}>通过</button>
              <button className="danger" onClick={() => decide(hub.id, "reject")}>拒绝</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败";
}
