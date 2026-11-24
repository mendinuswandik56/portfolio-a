import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Github, ExternalLink, LogIn, LogOut, Plus, UploadCloud, X,
  FolderGit2, Code2, Home, Menu, Facebook, Instagram,
  MessageCircle, Music2, Globe, ArrowUpRight, Pencil, Trash2,
  LayoutDashboard, Image, Eye, Bell, Sun, Moon, QrCode,
  Users, Send, Check, Search, UserRound, Monitor, Database,
  Palette, Code, Mail
} from 'lucide-react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, setDoc, where, increment
} from 'firebase/firestore';

import { auth, db, ADMIN_EMAIL } from './firebase';
import BackupRestore from './BackupRestore';
import { ContactForm, ContactInbox } from './ContactInbox';
import AnalyticsDashboard from './AnalyticsDashboard';
import './style.css';
const CLOUDINARY_CLOUD_NAME = 'ew3vk9zg';
const CLOUDINARY_UPLOAD_PRESET = 'aplannymw_unsigned';

const DEFAULT_PROFILE = {
  name: 'Aplannymw',
  tagline: 'Saya membangun sesuatu yang bermanfaat.',
  heroDescription: 'Saya seorang Web Developer yang tertarik pada dunia IT dan pengembangan solusi digital. Di sini Anda bisa melihat project dan karya yang saya kembangkan.',
  aboutTitle: 'Terus belajar, terus berkarya.',
  aboutParagraph1: 'Saya adalah Aplannymw, seorang Web Developer dengan minat di bidang IT. Saya senang mengeksplorasi teknologi, membangun website, dan mengembangkan ide menjadi solusi digital.',
  aboutParagraph2: 'Saya terus belajar dan mencoba teknologi baru untuk meningkatkan kemampuan serta menciptakan karya digital yang bermanfaat.',
  imageUrl: '/portfolio-a/profile.jpg',
  github: 'https://github.com/meskowan',
  whatsapp: 'https://wa.me/6282238594968',
  facebook: 'https://www.facebook.com/search/top?q=dikwan%20q%20mw',
  tiktok: 'https://www.tiktok.com/@Aplannymw',
  instagram: 'https://www.instagram.com/Aplannymw/',
  website: 'https://meskowan.github.io/portfolio-aplannymw/'
};

const LEARNING_ITEMS = [
  { title: 'Belajar HTML', description: 'Mempelajari struktur dasar halaman website.', level: 'Pemula', category: 'Frontend', url: 'https://developer.mozilla.org/id/docs/Learn_web_development/Core/Structuring_content' },
  { title: 'Belajar CSS', description: 'Mengatur warna, layout, dan desain website.', level: 'Pemula', category: 'Frontend', url: 'https://developer.mozilla.org/id/docs/Learn_web_development/Core/Styling_basics' },
  { title: 'Belajar JavaScript', description: 'Membuat website menjadi lebih interaktif.', level: 'Pemula', category: 'Frontend', url: 'https://developer.mozilla.org/id/docs/Learn_web_development/Core/Scripting' },
  { title: 'Belajar React', description: 'Membangun antarmuka aplikasi menggunakan React.', level: 'Menengah', category: 'Frontend', url: 'https://react.dev/learn' },
  { title: 'Belajar Bootstrap', description: 'Membuat desain website dengan lebih cepat.', level: 'Pemula', category: 'Frontend', url: 'https://getbootstrap.com/docs/' },
  { title: 'Belajar Tailwind CSS', description: 'Mendesain website menggunakan utility classes.', level: 'Pemula', category: 'Frontend', url: 'https://tailwindcss.com/docs' },
  { title: 'Responsive Web Design', description: 'Membuat website nyaman dibuka di HP dan komputer.', level: 'Pemula', category: 'Frontend', url: 'https://web.dev/learn/design/' },
  { title: 'Belajar PHP', description: 'Membuat website dinamis menggunakan PHP.', level: 'Pemula', category: 'Backend', url: 'https://www.php.net/manual/id/' },
  { title: 'Belajar Laravel', description: 'Membangun aplikasi web menggunakan framework Laravel.', level: 'Menengah', category: 'Backend', url: 'https://laravel.com/docs' },
  { title: 'Belajar CodeIgniter', description: 'Mengenal framework PHP yang ringan.', level: 'Menengah', category: 'Backend', url: 'https://codeigniter.com/user_guide/' },
  { title: 'Belajar Node.js', description: 'Menjalankan JavaScript di sisi server.', level: 'Menengah', category: 'Backend', url: 'https://nodejs.org/en/learn' },
  { title: 'Belajar Express.js', description: 'Membuat server dan aplikasi web dengan Express.', level: 'Menengah', category: 'Backend', url: 'https://expressjs.com/en/starter/installing.html' },
  { title: 'Belajar REST API', description: 'Memahami komunikasi data antar aplikasi.', level: 'Menengah', category: 'Backend', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides' },
  { title: 'Belajar MySQL', description: 'Membuat dan mengelola database website.', level: 'Pemula', category: 'Database', url: 'https://dev.mysql.com/doc/' },
  { title: 'Belajar Firebase', description: 'Mengenal autentikasi dan database online.', level: 'Menengah', category: 'Database', url: 'https://firebase.google.com/docs' },
  { title: 'Belajar WordPress', description: 'Membuat website dengan WordPress.', level: 'Pemula', category: 'CMS', url: 'https://learn.wordpress.org/' },
  { title: 'Belajar XAMPP', description: 'Menjalankan Apache dan MySQL di komputer lokal.', level: 'Pemula', category: 'Tools', url: 'https://www.apachefriends.org/index.html' },
  { title: 'Belajar Composer', description: 'Mengelola library dan dependensi PHP.', level: 'Menengah', category: 'Tools', url: 'https://getcomposer.org/doc/' },
  { title: 'Belajar Git dan GitHub', description: 'Menyimpan, mengelola, dan membagikan project.', level: 'Pemula', category: 'Tools', url: 'https://docs.github.com/id' },
  { title: 'Belajar Figma UI/UX', description: 'Mendesain tampilan dan pengalaman pengguna.', level: 'Pemula', category: 'Design', url: 'https://www.figma.com/resource-library/' }
];

const LEARNING_CATEGORIES = [
  'Semua', 'Frontend', 'Backend', 'Database', 'CMS', 'Tools', 'Design'
];

const SKILLS = [
  { name: 'HTML', category: 'Frontend', icon: Code },
  { name: 'CSS', category: 'Frontend', icon: Palette },
  { name: 'JavaScript', category: 'Frontend', icon: Code2 },
  { name: 'React', category: 'Frontend', icon: Monitor },
  { name: 'PHP', category: 'Backend', icon: Code },
  { name: 'Laravel', category: 'Backend', icon: Code2 },
  { name: 'Firebase', category: 'Database', icon: Database },
  { name: 'MySQL', category: 'Database', icon: Database },
  { name: 'GitHub', category: 'Tools', icon: Github },
  { name: 'Figma', category: 'Design', icon: Palette }
];

function ProjectComments({ projectId }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('projectId', '==', projectId),
      where('status', '==', 'approved')
    );

    return onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) -
          (a.createdAt?.toMillis?.() || 0)
      );
      setComments(items);
    }, error => console.error('Comment read error:', error));
  }, [projectId]);

  async function submitComment(e) {
    e.preventDefault();
    if (sending) return;

    const cleanName = name.trim();
    const cleanText = commentText.trim();

    if (!cleanName || !cleanText) {
      setMessage('Nama dan komentar harus diisi.');
      return;
    }

    if (cleanName.length > 60 || cleanText.length > 1000) {
      setMessage('Nama maksimal 60 karakter dan komentar maksimal 1000 karakter.');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'comments'), {
        projectId,
        name: cleanName,
        text: cleanText,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setName('');
      setCommentText('');
      setMessage('Komentar dikirim dan menunggu persetujuan admin.');
    } catch (error) {
      console.error(error);
      setMessage('Komentar gagal dikirim. Coba lagi.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="project-comments">
      <h4><MessageCircle size={17} /> Komentar ({comments.length})</h4>

      {comments.length === 0 ? (
        <p className="comment-empty">Belum ada komentar yang disetujui.</p>
      ) : (
        <div className="comment-list">
          {comments.map(c => (
            <div className="comment-item" key={c.id}>
              <strong>{c.name}</strong>
              <p>{c.text}</p>
              <small>
                {c.createdAt?.toDate
                  ? c.createdAt.toDate().toLocaleString('id-ID')
                  : 'Baru saja'}
              </small>
            </div>
          ))}
        </div>
      )}

      <form className="comment-form" onSubmit={submitComment}>
        <label>Nama kamu</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
          required
          placeholder="Masukkan nama"
        />

        <label>Tulis komentar</label>
        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          maxLength={1000}
          rows="3"
          required
          placeholder="Bagaimana pendapat kamu tentang project ini?"
        />

        {message && <p className="comment-message" role="status">{message}</p>}

        <button className="primary" type="submit" disabled={sending}>
          {sending ? 'Mengirim...' : 'Kirim Komentar'}
          <MessageCircle size={16} />
        </button>
      </form>
    </div>
  );
}

async function shareProject(project) {
  const url = `${window.location.origin}${window.location.pathname}#project-${project.id}`;
  const text = `Lihat project ${project.title} di portfolio Aplannymw`;

  if (navigator.share) {
    try {
      await navigator.share({ title: project.title, text, url });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    alert('Link project berhasil disalin!');
  } catch {
    window.prompt('Salin link project berikut:', url);
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [pendingComments, setPendingComments] = useState([]);
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [visitorTotal, setVisitorTotal] = useState(0);
  const [newContactTotal, setNewContactTotal] = useState(0);

  const [showLogin, setShowLogin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showQr, setShowQr] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    tech: '',
    url: ''
  });
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE);
  const [file, setFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const [busy, setBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [profileStatus, setProfileStatus] = useState('');

  const [learningSearch, setLearningSearch] = useState('');
  const [learningCategory, setLearningCategory] = useState('Semua');
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [guestSending, setGuestSending] = useState(false);
  const [guestStatus, setGuestStatus] = useState('');

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('aplannymw-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const isAdmin =
    !!user &&
    user.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

  const waitingComments = pendingComments.filter(c => c.status === 'pending');
  const approvedComments = pendingComments.filter(c => c.status === 'approved');
  const waitingGuests = guestbookEntries.filter(g => g.status === 'pending');
  const approvedGuests = guestbookEntries.filter(g => g.status === 'approved');

  const imageCount = projects.filter(p => p.imageUrl).length;
  const linkCount = projects.filter(p => p.url).length;

  const filteredLearningItems = useMemo(() => {
    return LEARNING_ITEMS.filter(item => {
      const keyword = learningSearch.trim().toLowerCase();

      const matchesSearch =
        `${item.title} ${item.description} ${item.level} ${item.category}`
          .toLowerCase()
          .includes(keyword);

      return matchesSearch &&
        (learningCategory === 'Semua' || item.category === learningCategory);
    });
  }, [learningSearch, learningCategory]);

  const portfolioUrl = `${window.location.origin}${window.location.pathname}`;

  const qrImageUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(portfolioUrl)}`;

  function resetLearningFilter() {
    setLearningSearch('');
    setLearningCategory('Semua');
  }

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, snapshot => {
      setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error(err);
      setError(err.message);
    });
  }, []);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'profile'), snapshot => {
      if (snapshot.exists()) {
        setProfile({ ...DEFAULT_PROFILE, ...snapshot.data() });
      }
    }, err => console.error(err));
  }, []);

  useEffect(() => {
    return onSnapshot(doc(db, 'stats', 'visitors'), snapshot => {
      setVisitorTotal(
        snapshot.exists() ? Number(snapshot.data().total || 0) : 0
      );
    }, err => console.warn('Statistik belum tersedia:', err.message));
  }, []);

  
// Menghitung total pengunjung dan pengunjung harian
useEffect(() => {
  // TOTAL PENGUNJUNG: satu kali per browser
  let alreadyCounted = false;

  try {
    alreadyCounted =
      localStorage.getItem('aplannymw-visited') === 'yes';
  } catch {}

  if (!alreadyCounted) {
    setDoc(doc(db, 'stats', 'visitors'), {
      total: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true })
      .then(() => {
        try {
          localStorage.setItem('aplannymw-visited', 'yes');
        } catch {}
      })
      .catch(err => {
        console.warn(
          'Gagal menghitung pengunjung:',
          err.message
        );
      });
  }

  // PENGUNJUNG HARIAN: satu kali per browser setiap hari
  const now = new Date();

  const dateId = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  const dailyKey = `aplannymw-visited-${dateId}`;

  let alreadyCountedToday = false;

  try {
    alreadyCountedToday =
      localStorage.getItem(dailyKey) === 'yes';
  } catch {}

  if (alreadyCountedToday) return;

  setDoc(doc(db, 'analyticsDaily', dateId), {
    total: increment(1),
    updatedAt: serverTimestamp()
  }, { merge: true })
    .then(() => {
      try {
        localStorage.setItem(dailyKey, 'yes');
      } catch {}
    })
    .catch(err => {
      console.warn(
        'Gagal menghitung pengunjung harian:',
        err.message
      );
    });

}, []);
  // Satu listener buku tamu:
  // Admin melihat semua pesan, pengunjung hanya melihat pesan disetujui.
  useEffect(() => {
    const guestbookQuery = isAdmin
      ? query(collection(db, 'guestbook'))
      : query(
          collection(db, 'guestbook'),
          where('status', '==', 'approved')
        );

    return onSnapshot(
      guestbookQuery,
      snapshot => {
        const items = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        items.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() || 0) -
            (a.createdAt?.toMillis?.() || 0)
        );

        setGuestbookEntries(items);
      },
      err => {
        console.error('Guestbook error:', err);
        setError(err.message);
      }
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setPendingComments([]);
      return;
    }

    return onSnapshot(collection(db, 'comments'), snapshot => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      items.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) -
          (a.createdAt?.toMillis?.() || 0)
      );

      setPendingComments(items);
    }, err => setError(err.message));
  }, [isAdmin]);

  // Memantau jumlah pesan kontak yang belum dibaca (status: new)
  useEffect(() => {
    if (!isAdmin) {
      setNewContactTotal(0);
      return;
    }

    const contactQuery = query(
      collection(db, 'contactMessages'),
      where('status', '==', 'new')
    );

    return onSnapshot(
      contactQuery,
      snapshot => {
        setNewContactTotal(snapshot.size);
      },
      err => {
        console.error('Contact notification error:', err);
      }
    );
  }, [isAdmin]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem('aplannymw-theme', theme);
    } catch {}
  }, [theme]);

  async function approveComment(id) {
    if (!isAdmin) return;

    try {
      await updateDoc(doc(db, 'comments', id), {
        status: 'approved'
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeComment(id) {
    if (!isAdmin || !window.confirm('Hapus komentar ini?')) return;

    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function approveGuest(id) {
    if (!isAdmin) return;

    try {
      await updateDoc(doc(db, 'guestbook', id), {
        status: 'approved'
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeGuest(id) {
    if (!isAdmin || !window.confirm('Hapus pesan buku tamu ini?')) return;

    try {
      await deleteDoc(doc(db, 'guestbook', id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitGuest(e) {
    e.preventDefault();
    if (guestSending) return;

    const cleanName = guestName.trim();
    const cleanMessage = guestMessage.trim();

    if (!cleanName || !cleanMessage) {
      setGuestStatus('Nama dan pesan wajib diisi.');
      return;
    }

    if (cleanName.length > 60 || cleanMessage.length > 500) {
      setGuestStatus('Nama maksimal 60 karakter dan pesan maksimal 500 karakter.');
      return;
    }

    setGuestSending(true);
    setGuestStatus('');

    try {
      await addDoc(collection(db, 'guestbook'), {
        name: cleanName,
        message: cleanMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setGuestName('');
      setGuestMessage('');
      setGuestStatus('Pesan terkirim dan menunggu persetujuan admin.');
    } catch (err) {
      console.error(err);
      setGuestStatus('Pesan gagal dikirim. Periksa aturan Firestore.');
    } finally {
      setGuestSending(false);
    }
  }

  async function login(e) {
    e.preventDefault();
    setError('');

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (
        result.user.email?.toLowerCase() !== ADMIN_EMAIL?.toLowerCase()
      ) {
        await signOut(auth);
        throw new Error('Akun ini bukan admin.');
      }

      setShowLogin(false);
      setPassword('');
      setEmail('');
      setShowDashboard(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setShowDashboard(false);
      setShowForm(false);
      setShowProfileForm(false);
      setShowMenu(false);
      setSelectedProject(null);
      setError('');
      setStatus('');
    } catch (err) {
      setError(err.message);
    }
  }

  function openAddForm() {
    setEditingProject(null);
    setForm({
      title: '',
      description: '',
      tech: '',
      url: ''
    });
    setFile(null);
    setError('');
    setStatus('');
    setShowForm(true);
  }

  function editProject(p) {
    setEditingProject(p);

    setForm({
      title: p.title || '',
      description: p.description || '',
      tech: Array.isArray(p.tech) ? p.tech.join(', ') : p.tech || '',
      url: p.url || ''
    });

    setFile(null);
    setError('');
    setStatus('');
    setShowForm(true);
  }

  function closeProjectForm() {
    if (busy) return;

    setShowForm(false);
    setEditingProject(null);
    setFile(null);
    setError('');
    setStatus('');
  }

  async function uploadImage(selectedFile) {
    if (selectedFile.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran gambar maksimal 5 MB.');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      throw new Error('Format gambar harus JPG, PNG, atau WebP.');
    }

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message || 'Gagal mengunggah gambar.'
      );
    }

    return result.secure_url;
  }

  async function saveProject(e) {
    e.preventDefault();
    if (busy) return;

    if (!isAdmin) {
      return setError('Silakan login sebagai admin.');
    }

    setBusy(true);
    setError('');
    setStatus('Menyimpan project...');

    try {
      let imageUrl = editingProject?.imageUrl || '';

      if (file) {
        setStatus('Mengunggah gambar...');
        imageUrl = await uploadImage(file);
      }

      const projectData = {
        title: form.title.trim(),
        description: form.description.trim(),
        tech: form.tech.split(',').map(x => x.trim()).filter(Boolean),
        url: form.url.trim(),
        imageUrl
      };

      if (editingProject) {
        await updateDoc(
          doc(db, 'projects', editingProject.id),
          projectData
        );
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp()
        });
      }

      setShowForm(false);
      setEditingProject(null);
      setFile(null);
      setStatus('');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus('');
    } finally {
      setBusy(false);
    }
  }

  async function removeProject(p) {
    if (!isAdmin || !window.confirm(`Hapus project "${p.title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'projects', p.id));
      alert('Project berhasil dihapus.');
    } catch (err) {
      setError(err.message);
    }
  }

  function openProfileForm() {
    setProfileForm({ ...profile });
    setProfileFile(null);
    setProfileStatus('');
    setError('');
    setShowProfileForm(true);
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!isAdmin || profileBusy) return;

    setProfileBusy(true);
    setError('');

    try {
      let imageUrl = profile.imageUrl || DEFAULT_PROFILE.imageUrl;

      if (profileFile) {
        imageUrl = await uploadImage(profileFile);
      }

      const updatedProfile = {
        ...profileForm,
        name: profileForm.name.trim(),
        imageUrl,
        updatedAt: serverTimestamp()
      };

      await setDoc(
        doc(db, 'settings', 'profile'),
        updatedProfile,
        { merge: true }
      );

      setShowProfileForm(false);
      setProfileFile(null);
      setProfileStatus('Profil berhasil diperbarui.');
    } catch (err) {
      setError(err.message);
      setProfileStatus('Gagal menyimpan profil.');
    } finally {
      setProfileBusy(false);
    }
  }

  function closeMenu() {
    setShowMenu(false);
  }

  function openDashboard() {
    setShowDashboard(true);
    closeMenu();

    setTimeout(() => {
      document.getElementById('dashboard')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  }

  const notificationTotal =
    waitingComments.length +
    waitingGuests.length +
    newContactTotal;

  return (
    <div className={`page ${theme === 'light' ? 'theme-light' : ''}`}>
      <nav className="nav wrap" id="top">
        <a
          className="brand"
          href="#home"
          onClick={() => {
            closeMenu();
            setShowDashboard(false);
          }}
        >
          <span className="brand-mark">P</span>
          {profile.name.toUpperCase()}
          <span className="dot">.</span>
        </a>

        <div className="nav-right-actions">
          <button
            className="theme-toggle"
            type="button"
            title="Ganti tema"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="mobile-menu-btn"
            type="button"
            aria-label="Buka menu"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className={`nav-actions ${showMenu ? 'menu-open' : ''}`}>
          <a href="#home" onClick={closeMenu}><Home size={15} />Beranda</a>
          <a href="#about" onClick={closeMenu}>Tentang</a>
          <a href="#skills" onClick={closeMenu}>Skill</a>
          <a href="#projects" onClick={closeMenu}>Project</a>
          <a href="#belajar" onClick={closeMenu}>Belajar</a>
          <a href="#guestbook" onClick={closeMenu}>Buku Tamu</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>

          {isAdmin && (
            <button className="admin-btn" onClick={openDashboard}>
              <LayoutDashboard size={16} />
              Dashboard
              {notificationTotal > 0 && (
                <span className="nav-notification-count">
                  {notificationTotal}
                </span>
              )}
            </button>
          )}

          {isAdmin ? (
            <button className="admin-btn" onClick={logout}>
              <LogOut size={16} />Keluar
            </button>
          ) : (
            <button
              className="admin-btn"
              onClick={() => {
                closeMenu();
                setError('');
                setShowLogin(true);
              }}
            >
              <LogIn size={16} />Admin
            </button>
          )}
        </div>
      </nav>

      <main>
        {isAdmin && showDashboard && (
          <section className="dashboard-section wrap" id="dashboard">
            <div className="dashboard-heading">
              <div>
                <div className="eyebrow">
                  <LayoutDashboard size={16} /> ADMIN PANEL
                </div>
                <h2>Dashboard Admin<span className="dot">.</span></h2>
                <p>Selamat datang, {user.email}.</p>
              </div>

              <div className="dashboard-heading-actions">
                <button
                  className="secondary"
                  onClick={() => setShowDashboard(false)}
                >
                  Kembali ke Portfolio
                </button>

                <button className="delete-project-btn" onClick={logout}>
                  <LogOut size={16} />
                  Keluar Admin
                </button>
              </div>
            </div>
          {/* BACKUP DAN RESTORE DATABASE */}
          <BackupRestore isAdmin={isAdmin} />
            <ContactInbox isAdmin={isAdmin} />
            <AnalyticsDashboard
             isAdmin={isAdmin}
           projects={projects}
          comments={pendingComments}
           guests={guestbookEntries}
           visitorTotal={visitorTotal}
             />
            <div className="dashboard-stats">
              {[
                [FolderGit2, projects.length, 'Total Project'],
                [Image, imageCount, 'Project bergambar'],
                [ExternalLink, linkCount, 'Project dengan link'],
                [Eye, visitorTotal, 'Total pengunjung'],
                [MessageCircle, waitingComments.length, 'Komentar menunggu'],
                [Users, waitingGuests.length, 'Buku tamu menunggu'],
                [Mail, newContactTotal, 'Pesan kontak baru']
              ].map(([Icon, value, label]) => (
                <div className="dashboard-card" key={label}>
                  <div className="dashboard-card-icon">
                    <Icon size={23} />
                  </div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="notification-card">
              <div className="notification-icon">
                <Bell size={25} />
              </div>
              <div className="notification-content">
                <h3>Notifikasi Dashboard</h3>
                <p>
                  {notificationTotal
                    ? `Ada ${notificationTotal} aktivitas yang menunggu pemeriksaan.`
                    : 'Tidak ada aktivitas yang menunggu pemeriksaan.'}
                </p>
              </div>
              <span className="notification-count">{notificationTotal}</span>
            </div>

            <div className="dashboard-list" id="comment-moderation">
              <div className="dashboard-list-heading">
                <div>
                  <h3>Moderasi Komentar</h3>
                  <p>Setujui atau hapus komentar pengunjung.</p>
                </div>
                <span>{waitingComments.length} Menunggu</span>
              </div>

              {waitingComments.length === 0 ? (
                <p className="comment-empty">Tidak ada komentar baru.</p>
              ) : (
                waitingComments.map(c => (
                  <div className="comment-admin-item" key={c.id}>
                    <div>
                      <strong>{c.name}</strong>
                      <p>{c.text}</p>
                      <small>
                        Project: {projects.find(p => p.id === c.projectId)?.title || 'Tidak ditemukan'}
                      </small>
                    </div>

                    <div className="comment-admin-actions">
                      <button
                        className="primary"
                        onClick={() => approveComment(c.id)}
                      >
                        <Check size={15} />Setujui
                      </button>
                      <button
                        className="delete-project-btn"
                        onClick={() => removeComment(c.id)}
                      >
                        <Trash2 size={15} />Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="dashboard-list-heading">
                <div>
                  <h3>Riwayat Komentar</h3>
                  <p>Komentar yang sudah disetujui.</p>
                </div>
                <span>{approvedComments.length} Disetujui</span>
              </div>

              {approvedComments.map(c => (
                <div className="comment-admin-item" key={c.id}>
                  <div>
                    <strong>{c.name}</strong>
                    <p>{c.text}</p>
                  </div>
                  <button
                    className="delete-project-btn"
                    onClick={() => removeComment(c.id)}
                  >
                    <Trash2 size={15} />Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="dashboard-list">
              <div className="dashboard-list-heading">
                <div>
                  <h3>Moderasi Buku Tamu</h3>
                  <p>Pesan baru perlu disetujui sebelum tampil.</p>
                </div>
                <span>{waitingGuests.length} Menunggu</span>
              </div>

              {waitingGuests.length === 0 ? (
                <p className="comment-empty">Tidak ada pesan baru.</p>
              ) : (
                waitingGuests.map(g => (
                  <div className="comment-admin-item" key={g.id}>
                    <div>
                      <strong>{g.name}</strong>
                      <p>{g.message}</p>
                    </div>

                    <div className="comment-admin-actions">
                      <button
                        className="primary"
                        onClick={() => approveGuest(g.id)}
                      >
                        <Check size={15} />Setujui
                      </button>
                      <button
                        className="delete-project-btn"
                        onClick={() => removeGuest(g.id)}
                      >
                        <Trash2 size={15} />Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="dashboard-list-heading">
                <div><h3>Pesan Buku Tamu Disetujui</h3></div>
                <span>{approvedGuests.length}</span>
              </div>

              {approvedGuests.map(g => (
                <div className="comment-admin-item" key={g.id}>
                  <div>
                    <strong>{g.name}</strong>
                    <p>{g.message}</p>
                  </div>
                  <button
                    className="delete-project-btn"
                    onClick={() => removeGuest(g.id)}
                  >
                    <Trash2 size={15} />Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="dashboard-quick-actions">
              <h3>Manajemen Konten Website</h3>
              <p>Kelola profil, project, dan konten yang ditampilkan pada portfolio.</p>

              <button className="primary" onClick={openProfileForm}>
                <UserRound size={17} />Kelola Profil
              </button>

              <button className="primary" onClick={openAddForm}>
                <Plus size={17} />Tambah Project
              </button>

              <button className="secondary" onClick={() => setShowQr(true)}>
                <QrCode size={17} />Lihat QR Code Portfolio
              </button>
            </div>

            <div className="dashboard-list">
              <div className="dashboard-list-heading">
                <div>
                  <h3>Daftar Project</h3>
                  <p>Edit atau hapus project yang sudah dipublikasikan.</p>
                </div>
                <span>{projects.length} Project</span>
              </div>

              {projects.map(p => (
                <div className="dashboard-project" key={p.id}>
                  <div className="dashboard-project-info">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} />
                    ) : (
                      <div className="dashboard-project-placeholder">
                        <FolderGit2 size={22} />
                      </div>
                    )}

                    <div>
                      <strong>{p.title}</strong>
                      <span>
                        {Array.isArray(p.tech) ? p.tech.join(', ') : p.tech}
                      </span>
                    </div>
                  </div>

                  <div className="project-admin-actions">
                    <button
                      className="edit-project-btn"
                      onClick={() => editProject(p)}
                    >
                      <Pencil size={15} />Edit
                    </button>
                    <button
                      className="delete-project-btn"
                      onClick={() => removeProject(p)}
                    >
                      <Trash2 size={15} />Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="hero wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />PORTFOLIO & PROJECT SHOWCASE
            </div>
            <h1>
              Halo, saya <em>{profile.name}.</em><br />
              {profile.tagline}
            </h1>
            <p className="lead">{profile.heroDescription}</p>

            <div className="hero-marquee" aria-label="Bidang keahlian Aplannymw">
              <div className="hero-marquee-track">
                <span>WEB DEVELOPER</span><i>✦</i>
                <span>FRONTEND DEVELOPER</span><i>✦</i>
                <span>UI DESIGN ENTHUSIAST</span><i>✦</i>
                <span>CREATIVE PROBLEM SOLVER</span><i>✦</i>
                <span>WEB DEVELOPER</span><i>✦</i>
                <span>FRONTEND DEVELOPER</span><i>✦</i>
                <span>UI DESIGN ENTHUSIAST</span><i>✦</i>
                <span>CREATIVE PROBLEM SOLVER</span><i>✦</i>
              </div>
            </div>

            <div className="hero-links">
              <a className="primary" href="#projects">
                Lihat Project <ExternalLink size={16} />
              </a>
              <a
                className="secondary"
                href={profile.github}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} />GitHub
              </a>
              <button className="secondary" onClick={() => setShowQr(true)}>
                <QrCode size={17} />QR Portfolio
              </button>
            </div>
          </div>

          <div className="hero-art">
            <div className="orb orb1" />
            <div className="orb orb2" />
            <div className="profile-photo-frame">
              <img src={profile.imageUrl} alt={`Foto profil ${profile.name}`} />
            </div>
            <div className="float-icon"><Code2 size={24} /></div>
          </div>
        </section>

        <section className="stats wrap">
          <div>
            <strong>{projects.length.toString().padStart(2, '0')}</strong>
            <span>Project dipublikasikan</span>
          </div>
          <div>
            <strong>{visitorTotal.toLocaleString('id-ID')}</strong>
            <span>Total pengunjung</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>Ide untuk dikembangkan</span>
          </div>
        </section>

        <section className="about wrap" id="about">
          <div className="about-icon">
            <img
              className="about-photo"
              src={profile.imageUrl}
              alt={`Foto ${profile.name}`}
            />
          </div>
          <div>
            <div className="eyebrow">SEDIKIT TENTANG SAYA</div>
            <h2>{profile.aboutTitle}</h2>
            <p>{profile.aboutParagraph1}</p>
            <p>{profile.aboutParagraph2}</p>
          </div>
          <a className="secondary" href="#contact">
            Hubungi saya <ArrowUpRight size={16} />
          </a>
        </section>

        <section className="skills-section wrap" id="skills">
          <div className="section-head">
            <div>
              <div className="eyebrow">KEMAMPUAN SAYA</div>
              <h2>Skill & Teknologi<span className="dot">.</span></h2>
              <p>Teknologi yang saya pelajari dan gunakan untuk mengembangkan project.</p>
            </div>
          </div>

          <div className="skills-grid">
            {SKILLS.map(skill => {
              const Icon = skill.icon;

              return (
                <div className="skill-card" key={skill.name}>
                  <Icon size={25} />
                  <strong>{skill.name}</strong>
                  <span>{skill.category}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="projects-section wrap" id="projects">
          <div className="section-head">
            <div>
              <div className="eyebrow">KARYA SAYA</div>
              <h2>Project pilihan<span className="dot">.</span></h2>
              <p>Kumpulan project yang pernah dan sedang saya kerjakan.</p>
            </div>

            {isAdmin && (
              <button className="primary" onClick={openAddForm}>
                <Plus size={17} />Tambah Project
              </button>
            )}
          </div>

          {error && !showLogin && !showForm && !showProfileForm && (
            <div className="error">{error}</div>
          )}

          {projects.length ? (
            <div className="project-grid">
              {projects.map(p => (
                <article
                  className="project-card"
                  id={`project-${p.id}`}
                  key={p.id}
                >
                  <div className="project-image">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} />
                    ) : (
                      <div className="image-placeholder">
                        <FolderGit2 size={38} />
                        <span>PROJECT PREVIEW</span>
                      </div>
                    )}
                  </div>

                  <div className="project-body">
                    <div className="tags">
                      {(Array.isArray(p.tech) ? p.tech : []).map((t, i) => (
                        <span key={i}>{t}</span>
                      ))}
                    </div>

                    <h3>{p.title}</h3>
                    <p>{p.description}</p>

                    <div className="project-card-actions">
                      <button
                        className="project-link"
                        onClick={() => setSelectedProject(p)}
                      >
                        <Eye size={15} />Detail Project
                      </button>

                      {p.url && (
                        <a
                          className="project-link"
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Demo <ExternalLink size={15} />
                        </a>
                      )}
                    </div>

                    <div className="project-share">
                      <button onClick={() => shareProject(p)}>
                        <ExternalLink size={15} />Bagikan
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Lihat project ${p.title}: ${portfolioUrl}#project-${p.id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={15} />WhatsApp
                      </a>

                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${portfolioUrl}#project-${p.id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Facebook size={15} />Facebook
                      </a>
                    </div>

                    <ProjectComments projectId={p.id} />

                    {isAdmin && (
                      <div className="project-admin-actions">
                        <button
                          className="edit-project-btn"
                          onClick={() => editProject(p)}
                        >
                          <Pencil size={15} />Edit
                        </button>
                        <button
                          className="delete-project-btn"
                          onClick={() => removeProject(p)}
                        >
                          <Trash2 size={15} />Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon"><FolderGit2 size={28} /></div>
              <h3>Belum ada project</h3>
              <p>Project yang Anda publikasikan akan tampil di sini.</p>

              {isAdmin && (
                <button className="primary" onClick={openAddForm}>
                  <Plus size={16} />Upload project pertama
                </button>
              )}
            </div>
          )}
        </section>

        <section className="learning-section wrap" id="belajar">
          <div className="section-head">
            <div>
              <div className="eyebrow">PUSAT PEMBELAJARAN</div>
              <h2>Belajar Gratis<span className="dot">.</span></h2>
              <p>Pelajari teknologi dan pengembangan website dari dasar. Gratis untuk semua orang.</p>
            </div>
          </div>

          <div className="learning-tools">
            <div className="learning-search-wrap">
              <Search size={17} />
              <input
                type="search"
                className="learning-search"
                placeholder="Cari HTML, PHP, Laravel, XAMPP..."
                value={learningSearch}
                onChange={e => setLearningSearch(e.target.value)}
                aria-label="Cari materi belajar"
              />

              {learningSearch && (
                <button
                  className="learning-clear-btn"
                  onClick={() => setLearningSearch('')}
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="learning-categories">
              {LEARNING_CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`learning-category-btn ${learningCategory === category ? 'active' : ''}`}
                  aria-pressed={learningCategory === category}
                  onClick={() => setLearningCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="learning-results">
            <span>
              Menampilkan <strong>{filteredLearningItems.length}</strong> dari {LEARNING_ITEMS.length} materi belajar
            </span>

            {(learningSearch || learningCategory !== 'Semua') && (
              <button
                className="learning-reset-btn"
                onClick={resetLearningFilter}
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="learning-grid">
            {filteredLearningItems.length ? (
              filteredLearningItems.map(item => (
                <article className="learning-card" key={item.title}>
                  <span className="learning-level">{item.level}</span>
                  <span className="learning-category-label">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learning-link"
                  >
                    Mulai Belajar <ExternalLink size={15} />
                  </a>
                </article>
              ))
            ) : (
              <div className="learning-empty">
                <FolderGit2 size={30} />
                <h3>Materi tidak ditemukan</h3>
                <p>Tidak ada materi yang cocok dengan pencarian atau kategori.</p>
                <button onClick={resetLearningFilter}>Reset Pencarian</button>
              </div>
            )}
          </div>
        </section>

        <section className="guestbook-section wrap" id="guestbook">
          <div className="section-head">
            <div>
              <div className="eyebrow">PESAN PENGUNJUNG</div>
              <h2>Buku Tamu<span className="dot">.</span></h2>
              <p>Tinggalkan pesan atau salam untuk portfolio ini.</p>
            </div>
          </div>

          <div className="guestbook-layout">
            <form className="guestbook-form" onSubmit={submitGuest}>
              <label>Nama</label>
              <input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                maxLength={60}
                required
                placeholder="Nama kamu"
              />

              <label>Pesan</label>
              <textarea
                value={guestMessage}
                onChange={e => setGuestMessage(e.target.value)}
                maxLength={500}
                rows="4"
                required
                placeholder="Tuliskan pesan kamu..."
              />

              {guestStatus && (
                <p className="comment-message">{guestStatus}</p>
              )}

              <button
                className="primary"
                type="submit"
                disabled={guestSending}
              >
                {guestSending ? 'Mengirim...' : 'Kirim Pesan'}
                <Send size={16} />
              </button>
            </form>

            <div className="guestbook-list">
              <h3>Pesan Pengunjung ({approvedGuests.length})</h3>

              {approvedGuests.length === 0 ? (
                <p className="comment-empty">
                  Belum ada pesan yang ditampilkan.
                </p>
              ) : (
                approvedGuests.map(g => (
                  <article className="guestbook-entry" key={g.id}>
                    <strong>{g.name}</strong>
                    <p>{g.message}</p>
                    <small>
                      {g.createdAt?.toDate
                        ? g.createdAt.toDate().toLocaleDateString('id-ID')
                        : 'Pengunjung'}
                    </small>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="qr-section wrap">
          <div>
            <div className="eyebrow">BAGIKAN PORTFOLIO</div>
            <h2>Scan QR Code<span className="dot">.</span></h2>
            <p>Bagikan alamat portfolio Aplannymw dengan mudah melalui QR Code.</p>
          </div>

          <button className="secondary" onClick={() => setShowQr(true)}>
            <QrCode size={18} />Tampilkan QR Code
          </button>
        </section>

        <section className="contact-section wrap" id="contact">
          <h3>Kirim Pesan Langsung</h3>
           <p>Silakan kirim pesan melalui formulir berikut.</p>
          <ContactForm />
          <div className="eyebrow">HUBUNGI SAYA</div>
          <h2>
            Punya ide menarik?<br />
            <span className="gradient">Mari kita wujudkan bersama.</span>
          </h2>
          <p>
            Saya terbuka untuk bertukar ide, berdiskusi tentang teknologi,
            dan berkolaborasi dalam pengembangan project digital.
          </p>

          <div className="contact-links">
            <a href={profile.whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle size={18} />WhatsApp
            </a>
            <a href={profile.facebook} target="_blank" rel="noreferrer">
              <Facebook size={18} />Facebook
            </a>
            <a href={profile.tiktok} target="_blank" rel="noreferrer">
              <Music2 size={18} />TikTok
            </a>
            <a href={profile.instagram} target="_blank" rel="noreferrer">
              <Instagram size={18} />Instagram
            </a>
            <a href={profile.website} target="_blank" rel="noreferrer">
              <Globe size={18} />Website
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              <Github size={18} />GitHub
            </a>
          </div>
        </section>
      </main>

      <footer className="footer wrap">
        <span>
          © {new Date().getFullYear()} {profile.name}. Dibuat dengan semangat berkarya.
        </span>
        <a href="#home">Kembali ke atas ↑</a>
      </footer>

      {showLogin && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setShowLogin(false);
              setError('');
            }
          }}
        >
          <form className="modal" onSubmit={login}>
            <button
              type="button"
              className="close"
              onClick={() => {
                setShowLogin(false);
                setError('');
              }}
            >
              <X />
            </button>

            <div className="modal-icon"><LogIn /></div>
            <h2>Admin Login</h2>
            <p>Masuk untuk mengelola portfolio.</p>

            <label>Email admin</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com"
            />

            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password Firebase"
            />

            {error && <div className="error">{error}</div>}

            <button className="primary full" type="submit">
              Masuk ke Dashboard <LogIn size={16} />
            </button>

            <small>Akun admin dibuat melalui Firebase Authentication.</small>
          </form>
        </div>
      )}

      {showProfileForm && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !profileBusy) {
              setShowProfileForm(false);
            }
          }}
        >
          <form className="modal" onSubmit={saveProfile}>
            <button
              type="button"
              className="close"
              disabled={profileBusy}
              onClick={() => setShowProfileForm(false)}
            >
              <X />
            </button>

            <div className="modal-icon"><UserRound /></div>
            <h2>Manajemen Profil</h2>
            <p>Ubah informasi portfolio.</p>

            {[
              ['name', 'Nama profil'],
              ['tagline', 'Tagline'],
              ['heroDescription', 'Deskripsi beranda'],
              ['aboutTitle', 'Judul Tentang Saya'],
              ['aboutParagraph1', 'Paragraf Tentang Saya 1'],
              ['aboutParagraph2', 'Paragraf Tentang Saya 2'],
              ['whatsapp', 'Link WhatsApp'],
              ['facebook', 'Link Facebook'],
              ['tiktok', 'Link TikTok'],
              ['instagram', 'Link Instagram'],
              ['website', 'Link Website'],
              ['github', 'Link GitHub']
            ].map(([key, label]) => (
              <React.Fragment key={key}>
                <label>{label}</label>

                {key.includes('Description') || key.includes('Paragraph') ? (
                  <textarea
                    rows="3"
                    value={profileForm[key] || ''}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        [key]: e.target.value
                      })
                    }
                  />
                ) : (
                  <input
                    value={profileForm[key] || ''}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        [key]: e.target.value
                      })
                    }
                  />
                )}
              </React.Fragment>
            ))}

            <label>Foto profil (JPG/PNG/WebP, maksimal 5 MB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e => setProfileFile(e.target.files?.[0] || null)}
            />

            {profileStatus && <p>{profileStatus}</p>}
            {error && <div className="error">{error}</div>}

            <button
              className="primary full"
              disabled={profileBusy}
              type="submit"
            >
              {profileBusy ? 'Menyimpan...' : 'Simpan Profil'}
              <UploadCloud size={16} />
            </button>
          </form>
        </div>
      )}

      {showForm && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !busy) {
              closeProjectForm();
            }
          }}
        >
          <form className="modal" onSubmit={saveProject}>
            <button
              type="button"
              className="close"
              disabled={busy}
              onClick={closeProjectForm}
            >
              <X />
            </button>

            <div className="modal-icon">
              {editingProject ? <Pencil /> : <UploadCloud />}
            </div>

            <h2>{editingProject ? 'Edit project' : 'Publikasikan project'}</h2>
            <p>Isi informasi project Anda.</p>

            <label>Nama project</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Website Toko Online"
            />

            <label>Deskripsi</label>
            <textarea
              required
              rows="3"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ceritakan project ini..."
            />

            <label>Teknologi (pisahkan dengan koma)</label>
            <input
              value={form.tech}
              onChange={e => setForm({ ...form, tech: e.target.value })}
              placeholder="React, Firebase, CSS"
            />

            <label>Link project / demo (opsional)</label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />

            <label>Gambar cover (opsional, maksimal 5 MB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />

            {status && <p>{status}</p>}
            {error && <div className="error">{error}</div>}

            <button className="primary full" disabled={busy} type="submit">
              {busy
                ? 'Sedang memproses...'
                : editingProject
                  ? 'Simpan Perubahan'
                  : 'Publikasikan Project'}
              <UploadCloud size={16} />
            </button>
          </form>
        </div>
      )}

      {selectedProject && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <div className="modal project-detail-modal">
            <button
              className="close"
              onClick={() => setSelectedProject(null)}
            >
              <X />
            </button>

            {selectedProject.imageUrl && (
              <img
                className="detail-project-image"
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
              />
            )}

            <div className="eyebrow">DETAIL PROJECT</div>
            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>

            <div className="tags">
              {(Array.isArray(selectedProject.tech)
                ? selectedProject.tech
                : []
              ).map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>

            {selectedProject.url && (
              <a
                className="primary"
                href={selectedProject.url}
                target="_blank"
                rel="noreferrer"
              >
                Buka Project <ExternalLink size={16} />
              </a>
            )}

            <button
              className="secondary"
              onClick={() => shareProject(selectedProject)}
            >
              <ExternalLink size={16} />Bagikan Project
            </button>
          </div>
        </div>
      )}

      {showQr && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setShowQr(false);
            }
          }}
        >
          <div className="modal qr-modal">
            <button className="close" onClick={() => setShowQr(false)}>
              <X />
            </button>

            <div className="modal-icon"><QrCode /></div>
            <h2>QR Code Portfolio</h2>
            <p>Pindai QR Code untuk membuka website Aplannymw.</p>

            <img src={qrImageUrl} alt="QR Code portfolio Aplannymw" />

            <p className="qr-url">{portfolioUrl}</p>

            <button
              className="primary full"
              onClick={() => {
                navigator.clipboard?.writeText(portfolioUrl);
                alert('Link portfolio disalin.');
              }}
            >
              Salin Link Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
// Mengaktifkan Service Worker Aplannymw
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/portfolio-a/sw.js")
      .then((registration) => {
        console.log("Service Worker aktif:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker gagal:", error);
      });
  });
}