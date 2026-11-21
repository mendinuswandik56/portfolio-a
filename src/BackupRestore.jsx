
import React, { useState } from 'react';

import { db } from './firebase';

import {
  collection,
  doc,
  getDocs,
  getDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';

import {
  Download,
  UploadCloud,
  ShieldCheck,
  Database,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

// Mengubah Timestamp Firebase menjadi format JSON yang aman
function encodeData(value) {
  if (value instanceof Timestamp) {
    return {
      __backupType: 'firestore-timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds
    };
  }

  if (Array.isArray(value)) {
    return value.map(encodeData);
  }

  if (value && typeof value === 'object') {
    const result = {};

    Object.keys(value).forEach(key => {
      result[key] = encodeData(value[key]);
    });

    return result;
  }

  return value;
}

// Mengembalikan Timestamp ketika data dipulihkan
function decodeData(value) {
  if (Array.isArray(value)) {
    return value.map(decodeData);
  }

  if (value && typeof value === 'object') {
    if (value.__backupType === 'firestore-timestamp') {
      return new Timestamp(
        value.seconds,
        value.nanoseconds
      );
    }

    const result = {};

    Object.keys(value).forEach(key => {
      result[key] = decodeData(value[key]);
    });

    return result;
  }

  return value;
}

export default function BackupRestore({ isAdmin }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isAdmin) return null;

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  // Mengambil seluruh dokumen dari koleksi
  const getCollectionData = async name => {
    const snapshot = await getDocs(collection(db, name));

    return snapshot.docs.map(item => ({
      id: item.id,
      data: encodeData(item.data())
    }));
  };

  // BACKUP
  const createBackup = async () => {
    if (!isAdmin || busy) return;

    setBusy(true);
    setMessage('');

    try {
      const [
        projects,
        comments,
        guestbook,
        profileSnapshot
      ] = await Promise.all([
        getCollectionData('projects'),
        getCollectionData('comments'),
        getCollectionData('guestbook'),
        getDoc(doc(db, 'settings', 'profile'))
      ]);

      const backup = {
        app: 'Aplannymw Portfolio',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),

        collections: {
          projects,
          comments,
          guestbook
        },

        profile: profileSnapshot.exists()
          ? encodeData(profileSnapshot.data())
          : null
      };

      const json = JSON.stringify(backup, null, 2);

      const blob = new Blob(
        [json],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;
      link.download =
        `aplannymw-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      showMessage(
        'Backup berhasil dibuat dan diunduh.'
      );
    } catch (error) {
      console.error('Backup error:', error);

      showMessage(
        'Backup gagal: ' + error.message,
        'error'
      );
    } finally {
      setBusy(false);
    }
  };

  // Memeriksa struktur file sebelum restore
  const validateBackup = backup => {
    if (
      !backup ||
      backup.app !== 'Aplannymw Portfolio' ||
      backup.schemaVersion !== 1 ||
      !backup.collections
    ) {
      throw new Error(
        'Format file backup tidak dikenali.'
      );
    }

    const names = [
      'projects',
      'comments',
      'guestbook'
    ];

    names.forEach(name => {
      if (
        !Array.isArray(backup.collections[name])
      ) {
        throw new Error(
          `Data ${name} tidak valid.`
        );
      }

      backup.collections[name].forEach(item => {
        if (
          !item ||
          typeof item.id !== 'string' ||
          !item.id.trim() ||
          !item.data ||
          typeof item.data !== 'object' ||
          Array.isArray(item.data)
        ) {
          throw new Error(
            `Ada dokumen ${name} yang tidak valid.`
          );
        }
      });
    });

    if (
      backup.profile !== null &&
      (
        !backup.profile ||
        typeof backup.profile !== 'object' ||
        Array.isArray(backup.profile)
      )
    ) {
      throw new Error('Data profil tidak valid.');
    }
  };

  // RESTORE
  const restoreBackup = async () => {
    if (!isAdmin || busy || !selectedFile) return;

    setBusy(true);
    setMessage('');

    try {
      const text = await selectedFile.text();
      const backup = JSON.parse(text);

      validateBackup(backup);

      const total =
        backup.collections.projects.length +
        backup.collections.comments.length +
        backup.collections.guestbook.length +
        (backup.profile ? 1 : 0);

      if (total === 0) {
        throw new Error(
          'File backup tidak memiliki data untuk dipulihkan.'
        );
      }

      const confirmed = window.confirm(
        `Pulihkan ${total} data dari file backup?\n\n` +
        'Data dengan ID yang sama akan diperbarui. ' +
        'Data lain yang sudah ada tidak dihapus.'
      );

      if (!confirmed) {
        setBusy(false);
        return;
      }

      const operations = [];

      ['projects', 'comments', 'guestbook'].forEach(
        collectionName => {
          backup.collections[collectionName].forEach(
            item => {
              operations.push({
                ref: doc(
                  db,
                  collectionName,
                  item.id
                ),
                data: decodeData(item.data)
              });
            }
          );
        }
      );

      if (backup.profile) {
        operations.push({
          ref: doc(db, 'settings', 'profile'),
          data: decodeData(backup.profile)
        });
      }

      // Maksimal 450 operasi per batch
      for (
        let index = 0;
        index < operations.length;
        index += 450
      ) {
        const batch = writeBatch(db);

        const chunk = operations.slice(
          index,
          index + 450
        );

        chunk.forEach(operation => {
          batch.set(
            operation.ref,
            operation.data,
            { merge: true }
          );
        });

        await batch.commit();
      }

      setSelectedFile(null);

      const input = document.getElementById(
        'aplannymw-backup-file'
      );

      if (input) input.value = '';

      showMessage(
        `Restore berhasil. ${total} data telah diproses.`
      );
    } catch (error) {
      console.error('Restore error:', error);

      showMessage(
        'Restore gagal: ' + error.message,
        'error'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="backup-panel">
      <div className="backup-heading">
        <div className="backup-heading-icon">
          <Database size={22} />
        </div>

        <div>
          <h2>Backup & Restore</h2>
          <p>
            Simpan dan pulihkan data website Aplannymw.
          </p>
        </div>
      </div>

      <div className="backup-info">
        <ShieldCheck size={19} />

        <span>
          Fitur ini hanya dapat digunakan oleh admin.
        </span>
      </div>

      <div className="backup-actions">
        <div className="backup-card">
          <Download size={25} />

          <h3>Backup Data</h3>

          <p>
            Unduh proyek, profil, komentar, dan buku tamu
            dalam satu file JSON.
          </p>

          <button
            type="button"
            onClick={createBackup}
            disabled={busy}
            className="backup-button"
          >
            <Download size={17} />
            Unduh Backup
          </button>
        </div>

        <div className="backup-card">
          <UploadCloud size={25} />

          <h3>Restore Data</h3>

          <p>
            Pulihkan data website dari file backup JSON.
          </p>

          <input
            id="aplannymw-backup-file"
            type="file"
            accept=".json,application/json"
            disabled={busy}
            onChange={event => {
              setSelectedFile(
                event.target.files?.[0] || null
              );
              setMessage('');
            }}
          />

          {selectedFile && (
            <p className="backup-file-name">
              File: {selectedFile.name}
            </p>
          )}

          <button
            type="button"
            onClick={restoreBackup}
            disabled={busy || !selectedFile}
            className="restore-button"
          >
            <UploadCloud size={17} />
            Pulihkan Backup
          </button>
        </div>
      </div>

      {busy && (
        <div className="backup-message">
          <Loader size={18} />
          Sedang memproses data...
        </div>
      )}

      {message && (
        <div
          className={`backup-message ${
            messageType === 'error'
              ? 'backup-error'
              : 'backup-success'
          }`}
        >
          {messageType === 'error'
            ? <AlertCircle size={18} />
            : <CheckCircle size={18} />
          }

          <span>{message}</span>
        </div>
      )}

      <p className="backup-warning">
        Penting: simpan file backup di tempat aman.
        Restore akan memperbarui dokumen dengan ID yang sama,
        tetapi tidak menghapus dokumen lain.
      </p>
    </section>
  );
}
