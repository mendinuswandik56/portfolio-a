
import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot
} from 'firebase/firestore';

import {
  BarChart3,
  Eye,
  MessageCircle,
  Users,
  Mail,
  TrendingUp
} from 'lucide-react';

import { db } from './firebase';

export default function AnalyticsDashboard({
  isAdmin,
  projects = [],
  comments = [],
  guests = [],
  visitorTotal = 0
}) {
  const [dailyStats, setDailyStats] = useState([]);
  const [contactTotal, setContactTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribeDaily = onSnapshot(
      collection(db, 'analyticsDaily'),
      snapshot => {
        const data = snapshot.docs.map(item => ({
          date: item.id,
          total: Number(item.data().total || 0)
        }));

        setDailyStats(data);
        setLoading(false);
        setError('');
      },
      err => {
        console.error(err);
        setError('Gagal memuat statistik harian.');
        setLoading(false);
      }
    );

    const unsubscribeContacts = onSnapshot(
      collection(db, 'contactMessages'),
      snapshot => {
        setContactTotal(snapshot.size);
      },
      err => {
        console.error(err);
      }
    );

    return () => {
      unsubscribeDaily();
      unsubscribeContacts();
    };
  }, [isAdmin]);

  const chartData = useMemo(() => {
    const dataMap = Object.fromEntries(
      dailyStats.map(item => [item.date, item.total])
    );

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const dateId = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');

      return {
        date: dateId,
        label: date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short'
        }),
        total: dataMap[dateId] || 0
      };
    });
  }, [dailyStats]);

  const maxVisitors = Math.max(
    1,
    ...chartData.map(item => item.total)
  );

  // Ekspor statistik ke CSV
  const exportCSV = () => {
    const rows = [
      ['Tanggal', 'Jumlah Pengunjung'],
      ...dailyStats
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(item => [item.date, item.total])
    ];

    const csvContent = rows
      .map(row =>
        row
          .map(value =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'aplannymw-analytics.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const dailyTotal = chartData.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // Statistik mingguan dan bulanan
  const today = new Date();

  const todayId = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  const weekStart = new Date(today);
  weekStart.setDate(
    today.getDate() - ((today.getDay() + 6) % 7)
  );

  const weekStartId = [
    weekStart.getFullYear(),
    String(weekStart.getMonth() + 1).padStart(2, '0'),
    String(weekStart.getDate()).padStart(2, '0')
  ].join('-');

  const weeklyTotal = dailyStats
    .filter(item =>
      item.date >= weekStartId &&
      item.date <= todayId
    )
    .reduce((sum, item) => sum + item.total, 0);

  const monthStartId = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    '01'
  ].join('-');

  const monthlyTotal = dailyStats
    .filter(item =>
      item.date >= monthStartId &&
      item.date <= todayId
    )
    .reduce((sum, item) => sum + item.total, 0);

  // Kartu statistik
  const cards = [
    {
      label: 'Total Pengunjung',
      value: visitorTotal,
      icon: Eye
    },
    {
      label: 'Total Proyek',
      value: projects.length,
      icon: BarChart3
    },
    {
      label: 'Total Komentar',
      value: comments.length,
      icon: MessageCircle
    },
    {
      label: 'Total Buku Tamu',
      value: guests.length,
      icon: Users
    },
    {
      label: 'Total Pesan Kontak',
      value: contactTotal,
      icon: Mail
    },
    {
      label: 'Pengunjung 7 Hari',
      value: dailyTotal,
      icon: TrendingUp
    },
    {
      label: 'Pengunjung Minggu Ini',
      value: weeklyTotal,
      icon: TrendingUp
    },
    {
      label: 'Pengunjung Bulan Ini',
      value: monthlyTotal,
      icon: BarChart3
    }
  ];

  if (!isAdmin) return null;

  return (
    <section className="analytics-dashboard">

      <div className="analytics-heading">
        <div>
          <span className="analytics-eyebrow">
            WEBSITE STATISTICS
          </span>

          <h2>Analytics Dashboard</h2>

          <p>
            Ringkasan aktivitas website Aplannymw.
          </p>
        </div>

        <div className="analytics-heading-icon">
          <BarChart3 size={25} />
        </div>
      </div>

      <div className="analytics-cards">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div className="analytics-card" key={index}>
              <div className="analytics-card-icon">
                <Icon size={21} />
              </div>

              <div className="analytics-card-value">
                {card.value.toLocaleString('id-ID')}
              </div>

              <div className="analytics-card-label">
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-chart-card">

        <div className="analytics-chart-heading">
          <div>
            <h3>Grafik Pengunjung</h3>
            <p>7 hari terakhir</p>
          </div>

          <div className="analytics-actions">
            <button
              type="button"
              className="analytics-export-btn"
              onClick={exportCSV}
            >
              Unduh CSV
            </button>

            <span className="analytics-chart-badge">
              <TrendingUp size={14} />
              Harian
            </span>
          </div>
        </div>

        {loading ? (
          <p>Memuat statistik...</p>
        ) : error ? (
          <p className="analytics-error">{error}</p>
        ) : (
          <div className="analytics-chart">
            {chartData.map(item => (
              <div
                className="analytics-bar-item"
                key={item.date}
              >
                <span className="analytics-bar-value">
                  {item.total}
                </span>

                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar"
                    style={{
                      height: `${Math.max(
                        item.total > 0 ? 5 : 0,
                        (item.total / maxVisitors) * 100
                      )}%`
                    }}
                  />
                </div>

                <span className="analytics-bar-label">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="analytics-chart-footer">
          Data harian dihitung berdasarkan browser/perangkat
          yang berkunjung.
        </div>

      </div>
    </section>
  );
}
