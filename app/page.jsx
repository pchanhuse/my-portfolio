"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// SUPABASE
// ============================================================
const SUPABASE_URL = "https://wbknzcrtyultbcoshiso.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6India256Y3J0eXVsdGJjb3NoaXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODcwMTEsImV4cCI6MjA5NDg2MzAxMX0.Lzsx3YC8ZJnZCijwnh9xa8qOk34738rlG-L85jGxMs0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchApps() {
  const { data, error } = await supabase.from("apps").select("*").order("order");
  if (error) throw error;
  return data.map(a => ({ ...a, tagColor: a.tag_color }));
}
async function upsertApp(app) {
  const row = { name: app.name, url: app.url, description: app.description, thumbnail: app.thumbnail, tag: app.tag, tag_color: app.tagColor, category: app.category, order: app.order };
  if (app.id && !app.id.toString().match(/^\d+$/)) row.id = app.id;
  const { error } = await supabase.from("apps").upsert(row);
  if (error) throw error;
}
async function deleteApp(id) {
  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) throw error;
}
async function updateOrder(apps) {
  await Promise.all(apps.map((app, i) => supabase.from("apps").update({ order: i }).eq("id", app.id)));
}

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_APPS = [
  {
    id: "1", name: "TaskFlow", url: "https://taskflow.vercel.app",
    description: "シンプルなタスク管理アプリ。ドラッグ&ドロップで整理できます。",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=240&fit=crop",
    tag: "NEW", tagColor: "#FFD700", category: "生産性", order: 0,
  },
  {
    id: "2", name: "WeatherNow", url: "https://weathernow.vercel.app",
    description: "現在地の天気をリアルタイムで確認できるウェザーアプリ。",
    thumbnail: "https://images.unsplash.com/photo-1504608524841-42584120d693?w=400&h=240&fit=crop",
    tag: "人気No.1", tagColor: "#e8002a", category: "ライフ", order: 1,
  },
  {
    id: "3", name: "NoteSync", url: "https://notesync.vercel.app",
    description: "Markdownで書けるノートアプリ。複数デバイスで同期対応。",
    thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=240&fit=crop",
    tag: "おすすめ", tagColor: "#00b894", category: "生産性", order: 2,
  },
  {
    id: "4", name: "ColorPick", url: "https://colorpick.vercel.app",
    description: "画像からカラーパレットを自動生成するデザインツール。",
    thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=240&fit=crop",
    tag: "BETA", tagColor: "#6c5ce7", category: "デザイン", order: 3,
  },
];

const ADMIN_ID = "taturou1182";
const ADMIN_PASSWORD = "pchange81";

const TAG_COLORS = ["#FFD700","#e8002a","#00b894","#6c5ce7","#0984e3","#fd79a8","#e17055","#111"];

// ============================================================
// CSS
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; -webkit-font-smoothing: antialiased; }

  @keyframes marquee   { to { transform: translateX(-50%); } }
  @keyframes wiggle    { 0%,100% { transform: rotate(-2deg) scale(1); } 50% { transform: rotate(2deg) scale(1.05); } }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes priceBlink{ 0%,100% { opacity:1; } 50% { opacity:0.55; } }
  @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

  .marquee-wrap { overflow: hidden; }
  .marquee-track {
    display: flex; width: max-content;
    animation: marquee 22s linear infinite;
  }
  .marquee-track span {
    white-space: nowrap; padding: 0 28px;
    font-size: 12px; font-weight: 900;
    letter-spacing: 0.1em; color: #111; text-transform: uppercase;
  }

  /* Cards */
  .card-link { text-decoration: none; color: inherit; display: block; }
  .card-inner {
    background: #fff; border: 2.5px solid #111; border-radius: 6px;
    overflow: hidden; transition: transform 0.18s ease, box-shadow 0.18s ease;
    box-shadow: 4px 5px 0 #111; position: relative;
    animation: fadeUp 0.4s ease both;
    height: 100%;
  }
  .card-link:hover .card-inner { transform: translateY(-5px) rotate(-0.4deg); box-shadow: 7px 10px 0 #111; }
  .card-thumb { width: 100%; height: 180px; object-fit: cover; display: block; transition: transform 0.3s ease; }
  .card-link:hover .card-thumb { transform: scale(1.04); }
  .open-badge {
    position: absolute; inset: 0; background: rgba(0,0,0,0.68);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s ease;
  }
  .card-link:hover .open-badge { opacity: 1; }
  .open-badge span {
    background: #FFD700; color: #111; font-size: 14px; font-weight: 900;
    padding: 8px 20px; border: 2px solid #111; border-radius: 2px; letter-spacing: 0.06em;
  }
  .starburst {
    position: absolute; top: 10px; right: 10px;
    width: 50px; height: 50px; border-radius: 50%;
    border: 2px solid #111; display: flex; align-items: center; justify-content: center;
    font-size: 8.5px; font-weight: 900; color: #111; text-align: center; line-height: 1.25;
    animation: wiggle 2.6s ease infinite; z-index: 2; box-shadow: 2px 2px 0 #111;
  }
  .price-tag {
    display: inline-block; background: #e8002a; color: #fff;
    font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 2px;
    letter-spacing: 0.06em; animation: priceBlink 2s ease infinite;
  }

  /* Filter pills */
  .filter-pill {
    display: inline-block; padding: 5px 14px; border: 2px solid #111;
    border-radius: 99px; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: background 0.14s, color 0.14s;
    background: #fff; color: #111; font-family: inherit;
    white-space: nowrap;
  }
  .filter-pill.active { background: #111; color: #fff; }
  .filter-pill:hover:not(.active) { background: #f5f5f5; }

  /* Admin rows */
  .admin-row { transition: background 0.12s; }
  .admin-row:hover { background: #fffbe6 !important; }
  .edit-btn:hover { background: #f3f4f6 !important; }
  .del-btn:hover  { background: #fee2e2 !important; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed #111; border-radius: 4px; padding: 20px;
    text-align: center; cursor: pointer; transition: background 0.14s;
    font-size: 13px; color: #666; font-weight: 700;
  }
  .upload-zone:hover, .upload-zone.drag-over { background: #fffbe6; }

  /* Modal overlay */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.52);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; animation: fadeIn 0.15s ease;
    padding: 16px;
  }
  .modal-box {
    background: #fff; border: 3px solid #111; border-radius: 6px;
    padding: 28px; width: 100%; max-width: 440px;
    box-shadow: 8px 8px 0 #111;
    animation: slideUp 0.2s ease;
    max-height: 90vh; overflow-y: auto;
  }

  /* Responsive grid */
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  @media (max-width: 600px) {
    .app-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .card-thumb { height: 130px; }
    .open-badge span { font-size: 12px; padding: 6px 12px; }
    .starburst { width: 40px; height: 40px; font-size: 7px; }
    .hero-title { font-size: 44px !important; }
    .header-logo { font-size: 22px !important; }
    .filter-scroll { overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
    .filter-scroll::-webkit-scrollbar { display: none; }
    .admin-row-btns { flex-direction: column; gap: 4px !important; }
  }
  @media (max-width: 380px) {
    .app-grid { grid-template-columns: 1fr; }
  }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// ============================================================
// OGP / Meta helper (Next.jsではhead.jsxに移動してください)
// ============================================================
function OGPMeta({ title = "My Apps", description = "ちょっとしたアイデアをカタチにしたアプリたち。全部無料でどうぞ。", url = "https://yoursite.vercel.app", image = "https://yoursite.vercel.app/og.png" }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (prop, val, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute("content", val);
    };
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:image", image, "property");
    setMeta("og:type", "website", "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  }, [title, description, url, image]);
  return null;
}

// ============================================================
// 公開ページ
// ============================================================
function PublicPage({ apps, onSwitchToAdmin }) {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [tapCount, setTapCount] = useState(0);
  const [showAdminBtn, setShowAdminBtn] = useState(false);
  const tapTimer = useRef(null);
  const marqueeText = "MY APPS　★　MADE WITH LOVE　★　CLICK TO TRY　★　FREE TO USE　★　";
  const repeated = marqueeText.repeat(8);

  const handleFooterTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 2000);
    if (next >= 5) {
      setShowAdminBtn(true);
      setTapCount(0);
      clearTimeout(tapTimer.current);
    }
  };

  const categories = ["すべて", ...Array.from(new Set(apps.map((a) => a.category).filter(Boolean)))];
  const filtered = activeCategory === "すべて" ? apps : apps.filter((a) => a.category === activeCategory);

  return (
    <>
      <StyleTag />
      <OGPMeta />
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Noto Sans JP', sans-serif" }}>

        {/* Header */}
        <header style={{ borderBottom: "3px solid #111", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="header-logo" style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.05em", color: "#111" }}>my</span>
              <span className="header-logo" style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.05em", color: "#e8002a" }}>apps</span>
              <span style={{ fontSize: 10, fontWeight: 900, background: "#FFD700", color: "#111", border: "1.5px solid #111", padding: "2px 5px", borderRadius: 2, letterSpacing: "0.06em", marginLeft: 2 }}>STORE</span>
            </div>
            {/* 管理ボタンはフッター5回タップで出現 */}
          </div>
        </header>

        {/* Marquee */}
        <div style={{ background: "#FFD700", borderBottom: "2.5px solid #111", height: 32, display: "flex", alignItems: "center" }} className="marquee-wrap">
          <div className="marquee-track">
            <span>{repeated}</span>
            <span>{repeated}</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 20px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: "#e8002a", textTransform: "uppercase", marginBottom: 10 }}>● 全アプリ無料公開中 ●</p>
          <h1 className="hero-title" style={{ fontSize: "clamp(40px,9vw,76px)", fontWeight: 900, color: "#111", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 14 }}>
            Apps I<br /><span style={{ color: "#e8002a" }}>Built.</span>
          </h1>
          <p style={{ fontSize: 14, color: "#555", maxWidth: 340, margin: "0 auto", lineHeight: 1.75 }}>
            ちょっとしたアイデアをカタチにしたアプリたち。<br />ぜんぶ無料でどうぞ。
          </p>
        </div>

        {/* Category filter */}
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px 28px" }}>
          <div className="filter-scroll" style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
            {categories.map((cat) => (
              <button key={cat} className={`filter-pill${activeCategory === cat ? " active" : ""}`} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <main style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px 80px" }}>
          <div className="app-grid">
            {filtered.map((app, i) => (
              <a key={app.id} href={app.url} target="_blank" rel="noopener noreferrer" className="card-link" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="card-inner">
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src={app.thumbnail} alt={app.name} className="card-thumb" />
                    {app.tag && (
                      <div className="starburst" style={{ background: app.tagColor || "#FFD700" }}>
                        {app.tag}
                      </div>
                    )}
                    <div className="open-badge"><span>今すぐ試す →</span></div>
                  </div>
                  <div style={{ padding: "13px 15px 15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111", letterSpacing: "-0.03em", flex: 1 }}>{app.name}</h2>
                      <span className="price-tag">FREE</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, marginBottom: 9 }}>{app.description}</p>
                    <div style={{ borderTop: "1.5px dashed #e0e0e0", paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace" }}>{app.url.replace(/^https?:\/\//, "")}</span>
                      {app.category && <span style={{ fontSize: 10, background: "#f5f5f5", color: "#666", padding: "2px 7px", borderRadius: 99, fontWeight: 700, border: "1px solid #e0e0e0" }}>{app.category}</span>}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "#999", fontSize: 14, paddingTop: 60 }}>該当するアプリがありません</p>
          )}
        </main>

        {/* Footer — 5回タップで管理ボタン出現 */}
        <footer
          onClick={handleFooterTap}
          style={{ borderTop: "3px solid #111", background: "#111", color: "#fff", padding: "20px 24px", textAlign: "center", cursor: "default", userSelect: "none", position: "relative" }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.12em", fontWeight: 700 }}>
            © 2026 — MADE WITH ♥

          </p>

          {showAdminBtn && (
            <div style={{ marginTop: 12, animation: "slideUp 0.25s ease" }}>
              <button
                onClick={(e) => { e.stopPropagation(); onSwitchToAdmin(); }}
                style={{ fontSize: 12, fontWeight: 900, padding: "6px 16px", background: "#FFD700", color: "#111", border: "2px solid #FFD700", borderRadius: 3, cursor: "pointer", letterSpacing: "0.06em", fontFamily: "inherit" }}
              >
                🔑 管理画面へ
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowAdminBtn(false); }}
                style={{ marginLeft: 8, fontSize: 11, padding: "6px 10px", background: "transparent", color: "#888", border: "1px solid #444", borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}
              >
                閉じる
              </button>
            </div>
          )}
        </footer>
      </div>
    </>
  );
}

// ============================================================
// 管理画面
// ============================================================
function AdminPage({ apps, setApps, onSwitchToPublic }) {
  const [authed, setAuthed] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const tryLogin = () => {
    if (loginId === ADMIN_ID && loginPw === ADMIN_PASSWORD) setAuthed(true);
    else setLoginError(true);
  };

  if (!authed) {
    const iStyle = (err) => ({
      padding: "10px 12px", border: `2px solid ${err ? "#e8002a" : "#111"}`,
      borderRadius: 3, fontSize: 14, outline: "none", fontFamily: "inherit",
      width: "100%", boxSizing: "border-box",
    });
    return (
      <>
        <StyleTag />
        <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Noto Sans JP', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", border: "3px solid #111", borderRadius: 6, padding: 32, width: "100%", maxWidth: 360, boxShadow: "6px 6px 0 #111", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>管理画面</h2>
              <p style={{ fontSize: 13, color: "#666" }}>IDとパスワードを入力してください</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", marginBottom: 5, color: "#111" }}>ID</label>
              <input type="text" value={loginId} onChange={(e) => { setLoginId(e.target.value); setLoginError(false); }} onKeyDown={(e) => e.key === "Enter" && tryLogin()} style={iStyle(loginError)} placeholder="admin" autoFocus autoComplete="username" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", marginBottom: 5, color: "#111" }}>パスワード</label>
              <input type="password" value={loginPw} onChange={(e) => { setLoginPw(e.target.value); setLoginError(false); }} onKeyDown={(e) => e.key === "Enter" && tryLogin()} style={iStyle(loginError)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            {loginError && <p style={{ fontSize: 12, color: "#e8002a", fontWeight: 700, background: "#fff0f0", border: "1.5px solid #e8002a", borderRadius: 3, padding: "6px 10px" }}>IDまたはパスワードが違います</p>}
            <button style={{ padding: "10px", background: "#FFD700", color: "#111", border: "2px solid #111", borderRadius: 3, fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "3px 3px 0 #111", fontFamily: "inherit" }} onClick={tryLogin}>ログイン</button>
            <button style={{ padding: "10px", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: 3, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={onSwitchToPublic}>← 公開ページへ</button>
          </div>
        </div>
      </>
    );
  }

  const handleDragStart = (i) => { dragItem.current = i; };
  const handleDragEnter = (i) => { dragOver.current = i; };
  const handleDragEnd = () => {
    const updated = [...apps];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOver.current, 0, dragged);
    dragItem.current = null; dragOver.current = null;
    setApps(updated);
    updateOrder(updated).catch(console.error);
  };

  const handleSave = async (app) => {
    const saved = app.id ? app : { ...app, order: apps.length };
    try { await upsertApp(saved); } catch(e) { console.error(e); }
    const refreshed = await fetchApps().catch(() => null);
    if (refreshed) setApps(refreshed);
    else {
      if (app.id) setApps(apps.map((a) => a.id === app.id ? app : a));
      else setApps([...apps, { ...saved, id: Date.now().toString() }]);
    }
    setShowForm(false); setEditingApp(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("削除しますか？")) {
      try { await deleteApp(id); } catch(e) { console.error(e); }
      setApps(apps.filter((a) => a.id !== id));
    }
  };

  return (
    <>
      <StyleTag />
      <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Noto Sans JP', sans-serif" }}>
        <header style={{ borderBottom: "3px solid #111", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
            <h1 style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.03em" }}>管理画面</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 14px", background: "#FFD700", color: "#111", border: "2px solid #111", borderRadius: 3, fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setEditingApp(null); setShowForm(true); }}>＋ 追加</button>
              <button style={{ padding: "6px 14px", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: 3, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={onSwitchToPublic}>公開ページ →</button>
            </div>
          </div>
        </header>
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 80px" }}>
          <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, fontWeight: 700 }}>⠿ ドラッグ&ドロップで並び替え</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {apps.map((app, i) => (
              <div key={app.id} draggable
                onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
                className="admin-row"
                style={{ background: "#fff", border: "2px solid #111", borderRadius: 4, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "grab", boxShadow: "3px 3px 0 #111" }}
              >
                <span style={{ fontSize: 18, color: "#ccc", userSelect: "none", flexShrink: 0 }}>⠿</span>
                <img src={app.thumbnail} alt="" style={{ width: 52, height: 38, objectFit: "cover", borderRadius: 2, border: "1.5px solid #111", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 900, color: "#111" }}>{app.name}</p>
                    {app.tag && <span style={{ fontSize: 9, fontWeight: 900, background: app.tagColor || "#FFD700", color: "#111", padding: "1px 6px", borderRadius: 99, border: "1px solid #111" }}>{app.tag}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.url}</p>
                </div>
                <div className="admin-row-btns" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="edit-btn" style={{ fontSize: 12, padding: "5px 11px", border: "2px solid #111", background: "#fff", cursor: "pointer", borderRadius: 2, fontWeight: 700, fontFamily: "inherit" }} onClick={() => { setEditingApp(app); setShowForm(true); }}>編集</button>
                  <button className="del-btn" style={{ fontSize: 12, padding: "5px 11px", border: "2px solid #e8002a", background: "#fff", cursor: "pointer", borderRadius: 2, fontWeight: 700, color: "#e8002a", fontFamily: "inherit" }} onClick={() => handleDelete(app.id)}>削除</button>
                </div>
              </div>
            ))}
          </div>
        </main>
        {showForm && <AppForm app={editingApp} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingApp(null); }} />}
      </div>
    </>
  );
}

// ============================================================
// App Form (追加・編集)
// ============================================================
function AppForm({ app, onSave, onCancel }) {
  const [form, setForm] = useState(app || { name: "", url: "", description: "", thumbnail: "", tag: "", tagColor: "#FFD700", category: "" });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((f) => ({ ...f, thumbnail: e.target.result }));
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const iStyle = { width: "100%", padding: "9px 11px", border: "2px solid #111", borderRadius: 3, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 900, color: "#111", marginBottom: 5, letterSpacing: "0.06em" };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box">
        <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, letterSpacing: "-0.02em" }}>
          {app ? "✏️ アプリを編集" : "＋ アプリを追加"}
        </h3>

        {/* アプリ名 */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>アプリ名</label>
          <input style={iStyle} value={form.name} onChange={set("name")} placeholder="TaskFlow" />
        </div>

        {/* URL */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>URL</label>
          <input style={iStyle} value={form.url} onChange={set("url")} placeholder="https://..." />
        </div>

        {/* 説明文 */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>説明文</label>
          <input style={iStyle} value={form.description} onChange={set("description")} placeholder="アプリの説明" />
        </div>

        {/* カテゴリ */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>カテゴリ（任意）</label>
          <input style={iStyle} value={form.category} onChange={set("category")} placeholder="生産性 / ライフ / デザインなど" />
        </div>

        {/* バッジテキスト + 色 */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>バッジ（任意）</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...iStyle, flex: 1 }} value={form.tag} onChange={set("tag")} placeholder="NEW / 人気No.1 など" />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <label style={{ fontSize: 10, fontWeight: 900, color: "#666", letterSpacing: "0.04em" }}>色</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 120 }}>
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, tagColor: c }))}
                    style={{
                      width: 22, height: 22, borderRadius: "50%", background: c,
                      border: form.tagColor === c ? "3px solid #111" : "1.5px solid #ccc",
                      cursor: "pointer", padding: 0, flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* サムネイル */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>サムネイル</label>

          {/* 画像アップロードゾーン */}
          <div
            className={`upload-zone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            style={{ marginBottom: 8 }}
          >
            📁 画像をドラッグ&ドロップ、またはクリックして選択
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageFile(e.target.files[0])} />
          </div>

          {/* URLでも入力可 */}
          <input style={{ ...iStyle, fontSize: 12, padding: "7px 10px", color: "#666" }} value={form.thumbnail.startsWith("data:") ? "" : form.thumbnail} onChange={set("thumbnail")} placeholder="またはURLで入力: https://..." />

          {/* プレビュー */}
          {form.thumbnail && (
            <div style={{ marginTop: 8, position: "relative" }}>
              <img src={form.thumbnail} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 3, border: "2px solid #111" }} />
              <button onClick={() => setForm((f) => ({ ...f, thumbnail: "" }))} style={{ position: "absolute", top: 6, right: 6, background: "#e8002a", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ flex: 1, padding: "10px", background: "#FFD700", color: "#111", border: "2px solid #111", borderRadius: 3, fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }} onClick={() => onSave(form)}>保存</button>
          <button style={{ flex: 1, padding: "10px", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: 3, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Root
// ============================================================
export default function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("public");

  useEffect(() => {
    fetchApps()
      .then(setApps)
      .catch(() => setApps(MOCK_APPS))
      .finally(() => setLoading(false));
  }, []);

  const handleSetApps = useCallback(async (newApps) => {
    setApps(newApps);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, color: "#999", fontWeight: 700, letterSpacing: "0.08em" }}>LOADING...</p>
        </div>
      </div>
    );
  }

  return view === "admin"
    ? <AdminPage apps={apps} setApps={handleSetApps} onSwitchToPublic={() => setView("public")} />
    : <PublicPage apps={apps} onSwitchToAdmin={() => setView("admin")} />;
}
