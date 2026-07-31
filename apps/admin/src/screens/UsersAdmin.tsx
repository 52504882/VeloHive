import { useState } from "react";
import { limitUser, searchUsers, type AdminUser } from "../services/adminRepository";

export function UsersAdmin() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");

  const runSearch = async () => {
    try {
      setUsers(await searchUsers(query));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "用户搜索失败");
    }
  };

  const setStatus = async (userId: string, status: AdminUser["status"]) => {
    try {
      await limitUser(userId, status);
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, status } : user));
      setMessage("用户状态已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "用户状态更新失败");
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>用户管理</h2>
        <span>{users.length} users</span>
      </div>
      <div className="toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索昵称" />
        <button onClick={runSearch}>搜索</button>
      </div>
      {message ? <p className="status">{message}</p> : null}
      <div className="table">
        {users.map((user) => (
          <article className="row-card" key={user.id}>
            <strong>{user.nickname}</strong>
            <span>{user.city} · {user.status}</span>
            <button onClick={() => setStatus(user.id, "active")}>恢复</button>
            <button onClick={() => setStatus(user.id, "limited")}>限制</button>
            <button className="danger" onClick={() => setStatus(user.id, "banned")}>封禁</button>
          </article>
        ))}
      </div>
    </section>
  );
}
