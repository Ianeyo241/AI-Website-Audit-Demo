'use client';

import { useState } from 'react';
import { styles } from '@/lib/ui';

export default function Home() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    setData(null);

    const res = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const audit = data?.audit;
  const scores = data?.scores;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          AI Site Audit Tool
        </h1>

        <p style={styles.subText}>
          Generate structured website audits in seconds
        </p>

        {/* INPUT */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <input
            style={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />

          <button style={styles.button} onClick={runAudit}>
            {loading ? 'Analyzing...' : 'Run Audit'}
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: '12px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Export PDF
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <p style={{ marginTop: 16, color: '#6b7280' }}>
            Scanning website and generating insights...
          </p>
        )}

        {/* RESULTS */}
        {audit && (
          <div id="audit-report" style={{ marginTop: 24 }}>

            {/* REPORT HEADER */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                Website Audit Report
              </h2>
              <p style={{ color: '#6b7280', fontSize: 14 }}>
                Generated for: {data.url}
              </p>
            </div>

            {/* SITE OVERVIEW */}
            <div className="card" style={styles.card}>
              <div style={styles.sectionTitle}>Site Overview</div>
              <p><b>URL:</b> {data.url}</p>
              <p><b>Title:</b> {data.title}</p>
            </div>

            {/* SEO */}
            <div className="card" style={styles.card}>
              <div style={styles.sectionTitle}>SEO Issues</div>
              {audit.seo.map((item: any, i: number) => (
                <div key={i} style={itemBlock}>
                  <p><b>Issue:</b> {item.issue}</p>
                  <p><b>Impact:</b> {item.impact}</p>
                  <p><b>Fix:</b> {item.fix}</p>
                </div>
              ))}
            </div>

            {/* UX */}
            <div className="card" style={styles.card}>
              <div style={styles.sectionTitle}>UX Issues</div>
              {audit.ux.map((item: any, i: number) => (
                <div key={i} style={itemBlock}>
                  <p><b>Issue:</b> {item.issue}</p>
                  <p><b>Impact:</b> {item.impact}</p>
                  <p><b>Fix:</b> {item.fix}</p>
                </div>
              ))}
            </div>

            {/* CONTENT */}
            <div className="card" style={styles.card}>
              <div style={styles.sectionTitle}>Content Issues</div>
              {audit.content.map((item: any, i: number) => (
                <div key={i} style={itemBlock}>
                  <p><b>Issue:</b> {item.issue}</p>
                  <p><b>Impact:</b> {item.impact}</p>
                  <p><b>Fix:</b> {item.fix}</p>
                </div>
              ))}
            </div>

            {/* TOP FIXES */}
            <div
              className="card"
              style={{
                ...styles.card,
                border: '2px solid #111',
              }}
            >
              <div style={styles.sectionTitle}>Top Fixes</div>
              <ul>
                {audit.top_fixes.map((fix: string, i: number) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {fix}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* PRINT STYLES */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
            }

            button,
            input {
              display: none !important;
            }

            #audit-report {
              padding: 0 !important;
            }

            .card {
              page-break-inside: avoid;
            }

            * {
              box-shadow: none !important;
            }
          }
        `}</style>

          {/* SCORES */}
          {scores && (
            <div className="card" style={{ ...styles.card, marginBottom: 20 }}>
              <div style={styles.sectionTitle}>Audit Scores</div>

              {[
                { label: 'SEO',     value: scores.seo },
                { label: 'UX',      value: scores.ux },
                { label: 'Content', value: scores.content },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{label}</span>
                    <span style={{ color: value >= 70 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626' }}>
                      {value}/100
                    </span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 999, height: 10 }}>
                    <div style={{
                      width: `${value}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: value >= 70 ? '#16a34a' : value >= 50 ? '#f59e0b' : '#dc2626',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}

              {/* Final Score */}
              <div style={{
                marginTop: 20,
                padding: '14px 18px',
                background: '#f9fafb',
                borderRadius: 10,
                border: '2px solid #111',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Overall Score</span>
                <span style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: scores.final >= 70 ? '#16a34a' : scores.final >= 50 ? '#d97706' : '#dc2626',
                }}>
                  {scores.final}<span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>/100</span>
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

/* SECTION BLOCK STYLE (keeps readability consistent) */
const itemBlock: React.CSSProperties = {
  borderTop: '1px solid #eee',
  paddingTop: 10,
  marginTop: 10,
};