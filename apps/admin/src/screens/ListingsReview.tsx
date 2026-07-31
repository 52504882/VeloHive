import { useEffect, useState } from "react";
import { approveListing, fetchPendingListings, rejectListing, type PendingListing } from "../services/adminRepository";

export function ListingsReview() {
  const [actorId, setActorId] = useState("");
  const [reason, setReason] = useState("");
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingListings().then(setListings).catch((error: unknown) => setMessage(readError(error)));
  }, []);

  const decide = async (listingId: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await approveListing(listingId, actorId, reason || "审核通过");
      } else {
        await rejectListing(listingId, actorId, reason || "审核拒绝");
      }
      setListings((current) => current.filter((listing) => listing.id !== listingId));
      setMessage("商品审核已处理");
    } catch (error) {
      setMessage(readError(error));
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>商品审核</h2>
        <span>{listings.length} pending</span>
      </div>
      <div className="toolbar">
        <input value={actorId} onChange={(event) => setActorId(event.target.value)} placeholder="审核员用户 ID" />
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="审核备注" />
      </div>
      {message ? <p className="status">{message}</p> : null}
      <div className="grid">
        {listings.map((listing) => (
          <article className="card" key={listing.id}>
            {listing.image_urls[0] ? <img src={listing.image_urls[0]} alt="" /> : null}
            <h3>{listing.title}</h3>
            <p>￥{listing.price.toLocaleString("zh-CN")}</p>
            <div className="actions">
              <button onClick={() => decide(listing.id, "approve")}>通过</button>
              <button className="danger" onClick={() => decide(listing.id, "reject")}>拒绝</button>
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
