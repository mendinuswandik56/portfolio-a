
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Github, ExternalLink, LogIn, LogOut, Plus,
  UploadCloud, X, FolderGit2, Code2, Home,
  Menu, Facebook, Instagram, MessageCircle,
  Music2, Globe, ArrowUpRight, Pencil, Trash2,
  LayoutDashboard, Image, BarChart3, UserRound
} from 'lucide-react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp,
  updateDoc, setDoc, where
} from 'firebase/firestore';

import { auth, db, ADMIN_EMAIL } from './firebase';
import './style.css';

const CLOUDINARY_CLOUD_NAME = 'ew3vk9zg';
const CLOUDINARY_UPLOAD_PRESET = 'aplannymw_unsigned';

// ========================================
// DATA PROFIL DEFAULT
// ========================================

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

// ========================================
// DATA BELAJAR GRATIS
// ========================================

const LEARNING_ITEMS = [
  {
    title: 'Belajar HTML',
    description: 'Pelajari dasar membuat struktur halaman website.',
    level: 'Pemula',
    url: 'https://developer.mozilla.org/id/docs/Learn_web_development/Core/Structuring_content'
  },
  {
    title: 'Belajar CSS',
    description: 'Pelajari cara mengatur warna, layout, dan desain website.',
    level: 'Pemula',
    url: 'https://developer.mozilla.org/id/docs/Learn_web_development/Core/Styling_basics'
  },
  {
    title: 'Belajar JavaScript',
    description: 'Kenali dasar pemrograman untuk membuat website interaktif.',
    level: 'Pemula',
    url: 'https://developer.mozilla.org/id/docs/Learn_web_development/Core/Scripting'
  },
  {
    title: 'Belajar React',
    description: 'Mulai membangun antarmuka aplikasi menggunakan React.',
    level: 'Menengah',
    url: 'https://react.dev/learn'
  },
  {
    title: 'Belajar Firebase',
    description: 'Pelajari autentikasi dan database untuk aplikasi.',
    level: 'Menengah',
    url: 'https://firebase.google.com/docs'
  },
  {
    title: 'Belajar GitHub',
    description: 'Pelajari cara menyimpan dan membagikan project.',
    level: 'Pemula',
    url: 'https://docs.github.com/id'
  }
];

// ========================================
// KATEGORI BELAJAR
// ========================================

const LEARNING_CATEGORIES = [
  'Semua',
  'Dasar',
  'Frontend',
  'Backend',
  'Tools'
];

function getLearningCategory(title) {
  const name = title.toLowerCase();

  if (
    name.includes('html') ||
    name.includes('css') ||
    name.includes('javascript')
  ) {
    return 'Dasar';
  }

  if (name.includes('react')) {
    return 'Frontend';
  }

  if (name.includes('firebase')) {
    return 'Backend';
  }

  if (name.includes('github')) {
    return 'Tools';
  }

  return 'Lainnya';
}

// ========================================
// KOMPONEN KOMENTAR PENGUNJUNG
// ========================================

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

    return onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setComments(items);
      },
      error => {
        console.error('Comment read error:', error);
      }
    );
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
      setMessage('Komentar berhasil dikirim dan sedang menunggu persetujuan admin.');
    } catch (error) {
      console.error('Comment submit error:', error);
      setMessage('Komentar gagal dikirim. Silakan coba lagi.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="project-comments">
      <h4>
        <MessageCircle size={17} />
        Komentar ({comments.length})
      </h4>

      {comments.length === 0 ? (
        <p className="comment-empty">
          Belum ada komentar yang disetujui.
        </p>
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

        {message && (
          <p className="comment-message" role="status">
            {message}
          </p>
        )}

        <button className="primary" type="submit" disabled={sending}>
          {sending ? 'Mengirim...' : 'Kirim Komentar'}
          <MessageCircle size={16} />
        </button>
      </form>
    </div>
  );
}

// ========================================
// FUNGSI BAGIKAN PROJECT
// ========================================

async function shareProject(project) {
  const url =
    `${window.location.origin}${window.location.pathname}#project-${project.id}`;

  const text = `Lihat project ${project.title} di portfolio Aplannymw`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: project.title,
        text,
        url
      });
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

// ========================================
// KOMPONEN UTAMA
// ========================================

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [pendingComments, setPendingComments] = useState([]);

  const [showLogin, setShowLogin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

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

  // STATE PENCARIAN DAN KATEGORI BELAJAR
  const [learningSearch, setLearningSearch] = useState('');
  const [learningCategory, setLearningCategory] = useState('Semua');

  const isAdmin =
    !!user &&
    user.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

  const imageCount = projects.filter(p => p.imageUrl).length;
  const linkCount = projects.filter(p => p.url).length;

  const waitingComments = pendingComments.filter(
    c => c.status === 'pending'
  );

  const approvedComments = pendingComments.filter(
    c => c.status === 'approved'
  );

  // FILTER MATERI BELAJAR
  const filteredLearningItems = LEARNING_ITEMS.filter(item => {
    const category = getLearningCategory(item.title);
    const keyword = learningSearch.toLowerCase().trim();

    const matchesSearch = (
      `${item.title} ${item.description} ${item.level} ${category}`
    ).toLowerCase().includes(keyword);

    const matchesCategory =
      learningCategory === 'Semua' ||
      category === learningCategory;

    return matchesSearch && matchesCategory;
  });

  // RESET PENCARIAN
  function resetLearningFilter() {
    setLearningSearch('');
    setLearningCategory('Semua');
  }

  // STATUS LOGIN
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // AMBIL DATA PROJECT
  useEffect(() => {
    const q = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      snapshot => {
        setProjects(snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })));
      },
      err => {
        console.error('Firestore error:', err);
        setError(err.message);
      }
    );
  }, []);

  // AMBIL DATA PROFIL DARI FIRESTORE
  useEffect(() => {
    return onSnapshot(
      doc(db, 'settings', 'profile'),
      snapshot => {
        if (snapshot.exists()) {
          setProfile({
            ...DEFAULT_PROFILE,
            ...snapshot.data()
          });
        }
      },
      err => {
        console.error('Profile error:', err);
      }
    );
  }, []);

  // AMBIL KOMENTAR UNTUK ADMIN SECARA REAL-TIME
  useEffect(() => {
    if (!isAdmin) {
      setPendingComments([]);
      return;
    }

    return onSnapshot(
      collection(db, 'comments'),
      snapshot => {
        const items = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setPendingComments(items);
      },
      err => {
        console.error('Admin comments error:', err);
        setError(err.message);
      }
    );
  }, [isAdmin]);

  // SETUJUI KOMENTAR
  async function approveComment(commentId) {
    if (!isAdmin) return;

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: 'approved'
      });
    } catch (err) {
      console.error('Approve comment error:', err);
      setError(err.message);
    }
  }

  // HAPUS KOMENTAR
  async function removeComment(commentId) {
    if (!isAdmin) return;

    if (!window.confirm('Yakin ingin menghapus komentar ini?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error('Delete comment error:', err);
      setError(err.message);
    }
  }

  // LOGIN ADMIN
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
        result.user.email?.toLowerCase() !==
        ADMIN_EMAIL?.toLowerCase()
      ) {
        await signOut(auth);
        throw new Error('Akun ini bukan admin.');
      }

      setShowLogin(false);
      setPassword('');
      setEmail('');
      setError('');
      setShowDashboard(true);

      setTimeout(() => {
        document.getElementById('dashboard')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  }

  // LOGOUT
  async function logout() {
    try {
      await signOut(auth);
      setShowDashboard(false);
      setShowForm(false);
      setShowProfileForm(false);
      setEditingProject(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  // BUKA FORM TAMBAH PROJECT
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

  // BUKA FORM EDIT PROJECT
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

  // TUTUP FORM PROJECT
  function closeProjectForm() {
    if (busy) return;

    setShowForm(false);
    setEditingProject(null);
    setFile(null);
    setError('');
    setStatus('');

    setForm({
      title: '',
      description: '',
      tech: '',
      url: ''
    });
  }

  // SIMPAN PROJECT
  async function saveProject(e) {
    e.preventDefault();

    if (busy) return;

    if (!isAdmin) {
      setError('Silakan login sebagai admin.');
      return;
    }

    setBusy(true);
    setError('');
    setStatus('Menyiapkan project...');

    try {
      let imageUrl = editingProject?.imageUrl || '';

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Ukuran gambar maksimal 5 MB.');
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('Format gambar harus JPG, PNG, atau WebP.');
        }

        setStatus('Mengunggah gambar...');

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Gagal mengunggah gambar.');
        }

        imageUrl = result.secure_url;
      }

      const projectData = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        tech: form.tech.split(',').map(x => x.trim()).filter(Boolean),
        url: form.url.trim(),
        imageUrl
      };

      setStatus('Menyimpan project...');

      if (editingProject) {
        await updateDoc(
          doc(db, 'projects', editingProject.id),
          projectData
        );
        setStatus('Project berhasil diperbarui!');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp()
        });
        setStatus('Project berhasil ditambahkan!');
      }

      setForm({
        title: '',
        description: '',
        tech: '',
        url: ''
      });

      setFile(null);
      setEditingProject(null);
      setShowForm(false);
      setError('');
      setStatus('');

    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
      setStatus('Penyimpanan gagal.');
    } finally {
      setBusy(false);
    }
  }

  // HAPUS PROJECT
  async function removeProject(p) {
    if (!isAdmin) {
      setError('Silakan login sebagai admin.');
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus project "${p.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'projects', p.id));
      setError('');
      alert('Project berhasil dihapus.');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  }

  // BUKA MANAJEMEN PROFIL
  function openProfileForm() {
    setProfileForm({ ...profile });
    setProfileFile(null);
    setProfileStatus('');
    setError('');
    setShowProfileForm(true);
  }

  // SIMPAN PROFIL
  async function saveProfile(e) {
    e.preventDefault();

    if (!isAdmin) {
      setError('Silakan login sebagai admin.');
      return;
    }

    if (profileBusy) return;

    setProfileBusy(true);
    setProfileStatus('Menyiapkan data profil...');
    setError('');

    try {
      let imageUrl = profile.imageUrl || DEFAULT_PROFILE.imageUrl;

      if (profileFile) {
        if (profileFile.size > 5 * 1024 * 1024) {
          throw new Error('Ukuran foto maksimal 5 MB.');
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(profileFile.type)) {
          throw new Error('Foto harus berformat JPG, PNG, atau WebP.');
        }

        setProfileStatus('Mengunggah foto profil...');

        const data = new FormData();
        data.append('file', profileFile);
        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Gagal mengunggah foto.');
        }

        imageUrl = result.secure_url;
      }

      const updatedProfile = {
        ...profileForm,
        name: profileForm.name.trim(),
        imageUrl,
        updatedAt: serverTimestamp()
      };

      setProfileStatus('Menyimpan profil ke Firebase...');

      await setDoc(
        doc(db, 'settings', 'profile'),
        updatedProfile
      );

      setProfile({
        ...updatedProfile,
        updatedAt: undefined
      });

      setProfileFile(null);
      setProfileStatus('Profil berhasil diperbarui!');
      setShowProfileForm(false);

    } catch (err) {
      console.error('Profile save error:', err);
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

  return (
    <div className="page">

      {/* NAVIGASI */}
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
          {profile.name.toUpperCase()}<span className="dot">.</span>
        </a>

        <button
          className="mobile-menu-btn"
          type="button"
          aria-label="Buka menu"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-actions ${showMenu ? 'menu-open' : ''}`}>
          <a href="#home" onClick={closeMenu}>
            <Home size={15} />Beranda
          </a>

          <a href="#about" onClick={closeMenu}>Tentang</a>
          <a href="#projects" onClick={closeMenu}>Project</a>
          <a href="#belajar" onClick={closeMenu}>Belajar Gratis</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>

          {isAdmin && (
            <button className="admin-btn" onClick={openDashboard}>
              <LayoutDashboard size={16} />Dashboard
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

        {/* DASHBOARD ADMIN */}
        {isAdmin && showDashboard && (
          <section className="dashboard-section wrap" id="dashboard">

            <div className="dashboard-heading">
              <div>
                <div className="eyebrow">
                  <LayoutDashboard size={16} />ADMIN PANEL
                </div>
                <h2>Dashboard Admin<span className="dot">.</span></h2>
                <p>Selamat datang kembali, {user.email}.</p>
              </div>

              <button
                className="secondary"
                onClick={() => setShowDashboard(false)}
              >
                Kembali ke Portfolio
              </button>
            </div>

            {/* STATISTIK */}
            <div className="dashboard-stats">
              <div className="dashboard-card">
                <div className="dashboard-card-icon">
                  <FolderGit2 size={24} />
                </div>
                <strong>{projects.length}</strong>
                <span>Total Project</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">
                  <Image size={24} />
                </div>
                <strong>{imageCount}</strong>
                <span>Project dengan Gambar</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">
                  <ExternalLink size={24} />
                </div>
                <strong>{linkCount}</strong>
                <span>Project dengan Link</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">
                  <BarChart3 size={24} />
                </div>
                <strong>{projects.length - linkCount}</strong>
                <span>Tanpa Link Demo</span>
              </div>
            </div>

            {/* NOTIFIKASI KOMENTAR REAL-TIME */}
            <div className="notification-card">
              <div className="notification-icon">
                <MessageCircle size={25} />
              </div>

              <div className="notification-content">
                <h3>Notifikasi Komentar</h3>

                <p>
                  {waitingComments.length > 0
                    ? `Ada ${waitingComments.length} komentar yang menunggu persetujuan.`
                    : 'Tidak ada komentar yang menunggu persetujuan.'}
                </p>

                {waitingComments.length > 0 && (
                  <div className="latest-notification">
                    <strong>{waitingComments[0].name}</strong>
                    <p>{waitingComments[0].text}</p>
                    <small>
                      Project ID: {waitingComments[0].projectId}
                    </small>
                  </div>
                )}
              </div>

              <span className="notification-count">
                {waitingComments.length}
              </span>

              <button
                type="button"
                className="notification-button"
                onClick={() => {
                  document.getElementById('comment-moderation')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Lihat
              </button>
            </div>

            {/* MODERASI KOMENTAR */}
            <div className="dashboard-list" id="comment-moderation">
              <div className="dashboard-list-heading">
                <div>
                  <h3>Moderasi Komentar</h3>
                  <p>Periksa komentar pengunjung sebelum ditampilkan.</p>
                </div>
                <span>{waitingComments.length} Menunggu</span>
              </div>

              {waitingComments.length === 0 ? (
                <div className="dashboard-empty">
                  <MessageCircle size={30} />
                  <p>Tidak ada komentar yang menunggu persetujuan.</p>
                </div>
              ) : (
                waitingComments.map(c => {
                  const project = projects.find(
                    p => p.id === c.projectId
                  );

                  return (
                    <div className="comment-admin-item" key={c.id}>
                      <div>
                        <strong>{c.name}</strong>
                        <p>{c.text}</p>
                        <small>
                          Project: {project?.title || 'Project tidak ditemukan'}
                        </small>
                        <small>
                          {c.createdAt?.toDate
                            ? c.createdAt.toDate().toLocaleString('id-ID')
                            : 'Baru saja'}
                        </small>
                      </div>

                      <div className="comment-admin-actions">
                        <button
                          className="primary"
                          type="button"
                          onClick={() => approveComment(c.id)}
                        >
                          Setujui
                        </button>

                        <button
                          className="delete-project-btn"
                          type="button"
                          onClick={() => removeComment(c.id)}
                        >
                          <Trash2 size={15} />Hapus
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="dashboard-list-heading">
                <div>
                  <h3>Riwayat Komentar</h3>
                  <p>Komentar yang sudah disetujui.</p>
                </div>
                <span>{approvedComments.length} Disetujui</span>
              </div>

              {approvedComments.length === 0 ? (
                <p className="comment-empty">
                  Belum ada komentar yang disetujui.
                </p>
              ) : (
                approvedComments.map(c => (
                  <div className="comment-admin-item" key={c.id}>
                    <div>
                      <strong>{c.name}</strong>
                      <p>{c.text}</p>
                      <small>
                        {projects.find(p => p.id === c.projectId)?.title ||
                          'Project tidak ditemukan'}
                      </small>
                    </div>

                    <button
                      className="delete-project-btn"
                      type="button"
                      onClick={() => removeComment(c.id)}
                    >
                      <Trash2 size={15} />Hapus
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* MANAJEMEN PROFIL */}
            <div className="dashboard-quick-actions">
              <h3>Manajemen Website</h3>

              <button className="primary" onClick={openProfileForm}>
                <UserRound size={17} />
                Kelola Profil Website
              </button>

              <p>
                Ubah nama, deskripsi, foto profil, dan kontak website.
              </p>
            </div>

            {/* AKSI CEPAT */}
            <div className="dashboard-quick-actions">
              <h3>Aksi Cepat</h3>

              <button className="primary" onClick={openAddForm}>
                <Plus size={17} />Tambah Project Baru
              </button>

              <a
                className="secondary"
                href="#projects"
                onClick={() => setShowDashboard(false)}
              >
                <FolderGit2 size={17} />Lihat Semua Project
              </a>
            </div>

            {/* PROJECT TERBARU */}
            <div className="dashboard-list">
              <div className="dashboard-list-heading">
                <div>
                  <h3>Project Terbaru</h3>
                  <p>Lima project terakhir yang tersimpan.</p>
                </div>
                <span>{projects.length} Project</span>
              </div>

              {projects.length === 0 ? (
                <div className="dashboard-empty">
                  <FolderGit2 size={32} />
                  <p>Belum ada project yang tersimpan.</p>
                  <button className="primary" onClick={openAddForm}>
                    <Plus size={16} />Tambah Project
                  </button>
                </div>
              ) : (
                projects.slice(0, 5).map(p => (
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
                          {Array.isArray(p.tech)
                            ? p.tech.join(', ')
                            : p.tech || 'Belum ada teknologi'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="edit-project-btn"
                      onClick={() => editProject(p)}
                    >
                      <Pencil size={15} />Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* BERANDA */}
        <section className="hero wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />PORTFOLIO & PROJECT SHOWCASE
            </div>

            <h1>
              Halo, saya <em>{profile.name}.</em>
              <br />
              {profile.tagline}
            </h1>

            <p className="lead">{profile.heroDescription}</p>

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
            </div>
          </div>

          <div className="hero-art">
            <div className="orb orb1" />
            <div className="orb orb2" />

            <div className="profile-photo-frame">
              <img
                src={profile.imageUrl}
                alt={`Foto profil ${profile.name}`}
              />
            </div>

            <div className="float-icon">
              <Code2 size={24} />
            </div>
          </div>
        </section>

        {/* STATISTIK PORTFOLIO */}
        <section className="stats wrap">
          <div>
            <strong>{projects.length.toString().padStart(2, '0')}</strong>
            <span>Project dipublikasikan</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>Ide untuk dikembangkan</span>
          </div>
          <div>
            <strong>01</strong>
            <span>Perjalanan kreatif</span>
          </div>
        </section>

        {/* TENTANG */}
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

        {/* PROJECT */}
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

                    {p.url && (
                      <a
                        className="project-link"
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat project <ExternalLink size={15} />
                      </a>
                    )}

                    {/* BAGIKAN PROJECT */}
                    <div className="project-share">
                      <button
                        type="button"
                        onClick={() => shareProject(p)}
                      >
                        <ExternalLink size={15} />Bagikan
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Lihat project ${p.title}: ${window.location.origin}${window.location.pathname}#project-${p.id}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={15} />WhatsApp
                      </a>

                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          `${window.location.origin}${window.location.pathname}#project-${p.id}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Facebook size={15} />Facebook
                      </a>
                    </div>

                    {/* KOMENTAR PENGUNJUNG */}
                    <ProjectComments projectId={p.id} />

                    {isAdmin && (
                      <div className="project-admin-actions">
                        <button
                          type="button"
                          className="edit-project-btn"
                          onClick={() => editProject(p)}
                        >
                          <Pencil size={15} />Edit
                        </button>

                        <button
                          type="button"
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
              <div className="empty-icon">
                <FolderGit2 size={28} />
              </div>
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

        {/* BELAJAR GRATIS - PENCARIAN DAN FILTER */}
        <section className="learning-section wrap" id="belajar">
          <div className="section-head">
            <div>
              <div className="eyebrow">PUSAT PEMBELAJARAN</div>

              <h2>
                Belajar Gratis<span className="dot">.</span>
              </h2>

              <p>
                Pelajari teknologi dan pengembangan website dari dasar.
                Gratis untuk semua orang.
              </p>
            </div>
          </div>

          {/* KOLOM PENCARIAN */}
          <div className="learning-tools">
            <div className="learning-search-wrap">
              <input
                type="search"
                className="learning-search"
                placeholder="Cari HTML, CSS, JavaScript, React..."
                value={learningSearch}
                onChange={e => setLearningSearch(e.target.value)}
                aria-label="Cari materi belajar"
              />

              {learningSearch && (
                <button
                  type="button"
                  className="learning-clear-btn"
                  aria-label="Hapus pencarian"
                  onClick={() => setLearningSearch('')}
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* FILTER KATEGORI */}
            <div className="learning-categories">
              {LEARNING_CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`learning-category-btn ${
                    learningCategory === category ? 'active' : ''
                  }`}
                  aria-pressed={learningCategory === category}
                  onClick={() => setLearningCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* JUMLAH HASIL */}
          <div className="learning-results">
            <span>
              Menampilkan <strong>{filteredLearningItems.length}</strong>
              {' '}dari {LEARNING_ITEMS.length} materi belajar
            </span>

            {(learningSearch || learningCategory !== 'Semua') && (
              <button
                type="button"
                className="learning-reset-btn"
                onClick={resetLearningFilter}
              >
                Reset filter
              </button>
            )}
          </div>

          {/* DAFTAR MATERI */}
          <div className="learning-grid">
            {filteredLearningItems.length > 0 ? (
              filteredLearningItems.map(item => (
                <article
                  className="learning-card"
                  key={item.title}
                >
                  <span className="learning-level">
                    {item.level}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <div className="learning-card-category">
                    {getLearningCategory(item.title)}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learning-link"
                  >
                    Mulai Belajar
                    <ExternalLink size={15} />
                  </a>
                </article>
              ))
            ) : (
              <div className="learning-empty">
                <div className="learning-empty-icon">
                  <FolderGit2 size={30} />
                </div>

                <h3>Materi tidak ditemukan</h3>

                <p>
                  Tidak ada materi yang cocok dengan pencarian atau kategori
                  yang Anda pilih.
                </p>

                <button
                  type="button"
                  onClick={resetLearningFilter}
                >
                  <X size={15} />
                  Reset Pencarian
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section className="contact-section wrap" id="contact">
          <div className="eyebrow">HUBUNGI SAYA</div>

          <h2>
            Punya ide menarik?
            <br />
            <span className="gradient">
              Mari kita wujudkan bersama.
            </span>
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

      {/* FOOTER */}
      <footer className="footer wrap">
        <span>
          © {new Date().getFullYear()} {profile.name}.
          Dibuat dengan semangat berkarya.
        </span>
        <a href="#home">Kembali ke atas ↑</a>
      </footer>

      {/* MODAL LOGIN */}
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

            <small>
              Akun admin dibuat melalui Firebase Authentication.
            </small>
          </form>
        </div>
      )}

      {/* MODAL MANAJEMEN PROFIL */}
      {showProfileForm && (
        <div
          className="overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !profileBusy) {
              setShowProfileForm(false);
              setProfileFile(null);
              setError('');
            }
          }}
        >
          <form className="modal" onSubmit={saveProfile}>
            <button
              type="button"
              className="close"
              disabled={profileBusy}
              onClick={() => {
                setShowProfileForm(false);
                setProfileFile(null);
                setError('');
              }}
            >
              <X />
            </button>

            <div className="modal-icon"><UserRound /></div>
            <h2>Manajemen Profil</h2>
            <p>Ubah informasi yang ditampilkan pada portfolio.</p>

            <label>Nama profil</label>
            <input
              required
              value={profileForm.name}
              onChange={e => setProfileForm({
                ...profileForm,
                name: e.target.value
              })}
            />

            <label>Deskripsi singkat / tagline</label>
            <input
              value={profileForm.tagline}
              onChange={e => setProfileForm({
                ...profileForm,
                tagline: e.target.value
              })}
            />

            <label>Deskripsi beranda</label>
            <textarea
              rows="3"
              value={profileForm.heroDescription}
              onChange={e => setProfileForm({
                ...profileForm,
                heroDescription: e.target.value
              })}
            />

            <label>Judul Tentang Saya</label>
            <input
              value={profileForm.aboutTitle}
              onChange={e => setProfileForm({
                ...profileForm,
                aboutTitle: e.target.value
              })}
            />

            <label>Paragraf Tentang Saya 1</label>
            <textarea
              rows="3"
              value={profileForm.aboutParagraph1}
              onChange={e => setProfileForm({
                ...profileForm,
                aboutParagraph1: e.target.value
              })}
            />

            <label>Paragraf Tentang Saya 2</label>
            <textarea
              rows="3"
              value={profileForm.aboutParagraph2}
              onChange={e => setProfileForm({
                ...profileForm,
                aboutParagraph2: e.target.value
              })}
            />

            <label>Foto profil</label>

            <div className="current-image">
              <img
                src={
                  profileFile
                    ? URL.createObjectURL(profileFile)
                    : profile.imageUrl
                }
                alt="Preview foto profil"
              />
              <small>
                Foto saat ini. Pilih foto baru untuk menggantinya.
              </small>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e => setProfileFile(e.target.files?.[0] || null)}
            />

            <h3>Informasi Kontak dan Media Sosial</h3>

            <label>Link WhatsApp</label>
            <input
              type="url"
              value={profileForm.whatsapp}
              onChange={e => setProfileForm({
                ...profileForm,
                whatsapp: e.target.value
              })}
              placeholder="https://wa.me/..."
            />

            <label>Link Facebook</label>
            <input
              type="url"
              value={profileForm.facebook}
              onChange={e => setProfileForm({
                ...profileForm,
                facebook: e.target.value
              })}
              placeholder="https://facebook.com/..."
            />

            <label>Link TikTok</label>
            <input
              type="url"
              value={profileForm.tiktok}
              onChange={e => setProfileForm({
                ...profileForm,
                tiktok: e.target.value
              })}
              placeholder="https://tiktok.com/@..."
            />

            <label>Link Instagram</label>
            <input
              type="url"
              value={profileForm.instagram}
              onChange={e => setProfileForm({
                ...profileForm,
                instagram: e.target.value
              })}
              placeholder="https://instagram.com/..."
            />

            <label>Link Website</label>
            <input
              type="url"
              value={profileForm.website}
              onChange={e => setProfileForm({
                ...profileForm,
                website: e.target.value
              })}
              placeholder="https://..."
            />

            <label>Link GitHub</label>
            <input
              type="url"
              value={profileForm.github}
              onChange={e => setProfileForm({
                ...profileForm,
                github: e.target.value
              })}
              placeholder="https://github.com/..."
            />

            {profileStatus && <p>{profileStatus}</p>}
            {error && <div className="error">{error}</div>}

            <button
              className="primary full"
              disabled={profileBusy}
              type="submit"
            >
              {profileBusy ? 'Sedang menyimpan...' : 'Simpan Profil'}
              <UploadCloud size={16} />
            </button>
          </form>
        </div>
      )}

      {/* MODAL TAMBAH DAN EDIT PROJECT */}
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

            <h2>
              {editingProject ? 'Edit project' : 'Publikasikan project'}
            </h2>
            <p>
              {editingProject
                ? 'Ubah informasi project Anda.'
                : 'Project akan langsung terlihat oleh pengunjung.'}
            </p>

            <label>Nama project</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({
                ...form,
                title: e.target.value
              })}
              placeholder="Contoh: Website Toko Online"
            />

            <label>Deskripsi</label>
            <textarea
              required
              rows="3"
              value={form.description}
              onChange={e => setForm({
                ...form,
                description: e.target.value
              })}
              placeholder="Ceritakan project ini..."
            />

            <label>Teknologi (pisahkan dengan koma)</label>
            <input
              value={form.tech}
              onChange={e => setForm({
                ...form,
                tech: e.target.value
              })}
              placeholder="React, Firebase, CSS"
            />

            <label>Link project / demo (opsional)</label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm({
                ...form,
                url: e.target.value
              })}
              placeholder="https://..."
            />

            <label>Gambar cover (opsional)</label>

            {editingProject?.imageUrl && !file && (
              <div className="current-image">
                <img
                  src={editingProject.imageUrl}
                  alt="Gambar project saat ini"
                />
                <small>
                  Gambar saat ini. Pilih gambar baru jika ingin menggantinya.
                </small>
              </div>
            )}

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

              {editingProject
                ? <Pencil size={16} />
                : <UploadCloud size={16} />}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
