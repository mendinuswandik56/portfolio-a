
import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Mail,
  Send,
  Check,
  Trash2,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

// FORM KONTAK UNTUK PENGUNJUNG
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  async function submitContact(e) {
    e.preventDefault();

    if (sending) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setStatus('Semua kolom wajib diisi.');
      return;
    }

    if (cleanName.length > 60 || cleanEmail.length > 120 ||
        cleanMessage.length > 2000) {
      setStatus('Nama maksimal 60, email 120, dan pesan 2000 karakter.');
      return;
    }

    setSending(true);
    setStatus('');

    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
        status: 'new',
        createdAt: serverTimestamp()
      });

      setName('');
      setEmail('');
      setMessage('');
      setStatus('Pesan berhasil dikirim. Terima kasih sudah menghubungi saya!');
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('Pesan gagal dikirim. Silakan coba lagi.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="guestbook-form contact-inbox-form" onSubmit={submitContact}>
      <label>Nama</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={60}
        required
        placeholder="Nama kamu"
      />

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        maxLength={120}
        required
        placeholder="nama@email.com"
      />

      <label>Pesan</label>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        maxLength={2000}
        rows="5"
        required
        placeholder="Tuliskan pesan atau ide kamu..."
      />

      {status && (
        <p className="comment-message" role="status">{status}</p>
      )}

      <button className="primary" type="submit" disabled={sending}>
        {sending ? 'Mengirim...' : 'Kirim Pesan'}
        <Send size={16} />
      </button>
    </form>
  );
}

// KOTAK MASUK UNTUK ADMIN
export function ContactInbox({ isAdmin }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    return onSnapshot(
      collection(db, 'contactMessages'),
      snapshot => {
        const items = snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

        items.sort((a, b) =>
          (b.createdAt?.toMillis?.() || 0) -
          (a.createdAt?.toMillis?.() || 0)
        );

        setMessages(items);
        setLoading(false);
      },
      err => {
        console.error('Contact inbox error:', err);
        setError('Gagal memuat pesan. Periksa Firestore Rules.');
        setLoading(false);
      }
    );
  }, [isAdmin]);

  if (!isAdmin) return null;

  const newMessages = messages.filter(item => item.status === 'new');
  const readMessages = messages.filter(item => item.status === 'read');

  async function markAsRead(id) {
    try {
      await updateDoc(doc(db, 'contactMessages', id), {
        status: 'read'
      });
    } catch (err) {
      setError('Gagal mengubah status pesan.');
      console.error(err);
    }
  }

  async function removeMessage(id) {
    if (!window.confirm('Yakin ingin menghapus pesan ini?')) return;

    try {
      await deleteDoc(doc(db, 'contactMessages', id));
    } catch (err) {
      setError('Gagal menghapus pesan.');
      console.error(err);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp?.toDate) return 'Baru saja';

    return timestamp.toDate().toLocaleString('id-ID');
  }

  function whatsappLink(item) {
    const phone = item.phone?.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Halo ${item.name}, terima kasih sudah menghubungi saya.`
    );

    return phone
      ? `https://wa.me/${phone}?text=${text}`
      : `mailto:${item.email}?subject=${encodeURIComponent('Balasan pesan portfolio')}`;
  }

  return (
    <div className="dashboard-list contact-inbox" id="contact-inbox">
      <div className="dashboard-list-heading">
        <div>
          <h3><Mail size={19} /> Contact Inbox</h3>
          <p>Pesan yang dikirim pengunjung melalui formulir kontak.</p>
        </div>
        <span>{newMessages.length} Pesan Baru</span>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <strong>{messages.length}</strong>
          <span>Total Pesan</span>
        </div>
        <div className="dashboard-card">
          <strong>{newMessages.length}</strong>
          <span>Belum Dibaca</span>
        </div>
        <div className="dashboard-card">
          <strong>{readMessages.length}</strong>
          <span>Sudah Dibaca</span>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p className="comment-empty">
          <RefreshCw size={16} /> Memuat pesan...
        </p>
      ) : messages.length === 0 ? (
        <p className="comment-empty">
          Belum ada pesan masuk.
        </p>
      ) : (
        messages.map(item => (
          <article className="comment-admin-item" key={item.id}>
            <div className="contact-message-content">
              <div className="contact-message-title">
                <strong>{item.name}</strong>
                <span className={`contact-status ${item.status}`}>
                  {item.status === 'new' ? 'Baru' : 'Sudah Dibaca'}
                </span>
              </div>

              <a href={`mailto:${item.email}`}>
                {item.email}
              </a>

              <p>{item.message}</p>

              <small>{formatDate(item.createdAt)}</small>

              <div className="comment-admin-actions">
                <a
                  className="primary"
                  href={whatsappLink(item)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={15} />
                  {item.phone ? 'WhatsApp' : 'Balas Email'}
                </a>

                {item.status === 'new' && (
                  <button
                    className="secondary"
                    onClick={() => markAsRead(item.id)}
                  >
                    <Check size={15} />Tandai Dibaca
                  </button>
                )}

                <button
                  className="delete-project-btn"
                  onClick={() => removeMessage(item.id)}
                >
                  <Trash2 size={15} />Hapus
                </button>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
