import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_ORDER = { X: 0, XI: 1, XII: 2 };

function groupByKelasRombel(data) {
  const map = {};
  data.forEach((item) => {
    const key = `${item.kelas}||${item.rombel}`;
    if (!map[key]) map[key] = { kelas: item.kelas, rombel: item.rombel, students: [] };
    map[key].students.push(item);
  });
  return Object.values(map).sort((a, b) => {
    const ko = (CLASS_ORDER[a.kelas] ?? 9) - (CLASS_ORDER[b.kelas] ?? 9);
    return ko !== 0 ? ko : a.rombel.localeCompare(b.rombel);
  });
}

function makeRow() {
  return { _uid: Math.random().toString(36).slice(2), nama: '', rayon: '', gender: 'L' };
}

function formatTanggal(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const inputStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 12,
  outline: 'none',
  width: '100%',
  background: '#fff',
  color: '#0f172a',
  boxSizing: 'border-box',
};

const selectStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 12,
  outline: 'none',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};

const thBase = {
  padding: '9px 12px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 700,
  color: '#94a3b8',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const KELAS_COLOR = {
  X:   { bg: '#ede9fe', text: '#5b21b6' },
  XI:  { bg: '#d1fae5', text: '#065f46' },
  XII: { bg: '#fef3c7', text: '#92400e' },
};

const DEFAULT_TANGGAL = ['', '', '', '', ''];

// ─── GENDER BADGE ─────────────────────────────────────────────────────────────
const GenderBadge = ({ val }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    background: val === 'L' ? '#dbeafe' : '#fce7f3',
    color: val === 'L' ? '#1d4ed8' : '#be185d',
    letterSpacing: '0.04em',
  }}>
    {val}
  </span>
);

// ─── MODAL TANGGAL ────────────────────────────────────────────────────────────
const ModalTanggal = ({ isOpen, tanggal, onSimpan, onClose }) => {
  const [draft, setDraft] = useState([...tanggal]);

  useEffect(() => { if (isOpen) setDraft([...tanggal]); }, [isOpen, tanggal]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'modalPop 0.18s ease',
        overflow: 'hidden',
      }}>
        <div style={{ background: '#0f172a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>
              Atur Jadwal Absensi
            </p>
            <h3 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 800, margin: '3px 0 0' }}>Tanggal H1 – H5</h3>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', color: '#64748b',
            width: 30, height: 30, borderRadius: 8, fontSize: 17, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {draft.map((val, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                background: '#f1f5f9', color: '#475569', fontWeight: 800,
                fontSize: 11, padding: '4px 10px', borderRadius: 6, minWidth: 30, textAlign: 'center',
              }}>
                H{i + 1}
              </span>
              <input
                type="date"
                value={val}
                onChange={(e) => {
                  const next = [...draft];
                  next[i] = e.target.value;
                  setDraft(next);
                }}
                style={{ ...inputStyle, flex: 1 }}
              />
              {val && (
                <button onClick={() => {
                  const next = [...draft]; next[i] = ''; setDraft(next);
                }} style={{
                  background: 'none', border: 'none', color: '#fca5a5',
                  cursor: 'pointer', fontSize: 14, padding: 4,
                }}>✕</button>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid #e2e8f0', borderRadius: 9,
            padding: '7px 16px', fontSize: 12, fontWeight: 700, color: '#94a3b8', cursor: 'pointer',
          }}>Batal</button>
          <button onClick={() => { onSimpan(draft); onClose(); }} style={{
            background: '#6366f1', border: 'none', borderRadius: 9,
            padding: '8px 18px', fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
          }}>Simpan Tanggal</button>
        </div>
      </div>
      <style>{`@keyframes modalPop { from { opacity:0;transform:scale(0.96) translateY(10px);} to {opacity:1;transform:scale(1) translateY(0);}}`}</style>
    </div>
  );
};

// ─── MODAL TAMBAH (MULTI-ROW) ─────────────────────────────────────────────────
const ModalTambah = ({ isOpen, onClose, onSimpan, onImportExcel }) => {
  const [kelas, setKelas] = useState('X');
  const [rombel, setRombel] = useState('');
  const [rows, setRows] = useState(() => [makeRow(), makeRow(), makeRow()]);
  const lastInputRef = useRef(null);

  const addRow = () => {
    setRows((r) => [...r, makeRow()]);
    setTimeout(() => lastInputRef.current?.focus(), 60);
  };

  const removeRow = (uid) =>
    setRows((r) => (r.length > 1 ? r.filter((x) => x._uid !== uid) : r));

  const updateRow = (uid, field, value) =>
    setRows((r) => r.map((x) => (x._uid === uid ? { ...x, [field]: value } : x)));

  const handleSimpan = () => {
    const valid = rows.filter((r) => r.nama.trim() && r.rayon.trim());
    if (!rombel.trim()) return Swal.fire('Oops', 'Isi nama rombel terlebih dahulu.', 'warning');
    if (valid.length === 0) return Swal.fire('Oops', 'Minimal isi 1 baris data siswa lengkap.', 'warning');
    onSimpan({ kelas, rombel, rows: valid });
  };

  const handleClose = () => {
    setKelas('X'); setRombel(''); setRows([makeRow(), makeRow(), makeRow()]); onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      onImportExcel(XLSX.utils.sheet_to_json(ws));
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  if (!isOpen) return null;
  const filledCount = rows.filter((r) => r.nama.trim() && r.rayon.trim()).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.65)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'modalPop 0.18s ease',
      }}>
        <div style={{ background: '#0f172a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Input Data Siswa</p>
            <h3 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 800, margin: '3px 0 0' }}>Tambah Siswa</h3>
          </div>
          <button onClick={handleClose} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', color: '#64748b', width: 30, height: 30,
            borderRadius: 8, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>Grup Kelas</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={kelas} onChange={(e) => setKelas(e.target.value)} style={{ ...selectStyle, flexShrink: 0 }}>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <input value={rombel} onChange={(e) => setRombel(e.target.value)} placeholder="Nama Rombel — contoh: PPLG 1" style={{ ...inputStyle, flex: 1 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '28px 1fr 130px 68px 28px',
            gap: 8, padding: '11px 0 6px', position: 'sticky', top: 0,
            background: '#fff', borderBottom: '1px solid #f1f5f9', zIndex: 1,
          }}>
            {['#', 'Nama Lengkap', 'Rayon', 'L / P', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {rows.map((row, idx) => (
            <div key={row._uid} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 130px 68px 28px',
              gap: 8, padding: '6px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600, textAlign: 'center' }}>{idx + 1}</span>
              <input
                ref={idx === rows.length - 1 ? lastInputRef : null}
                value={row.nama} onChange={(e) => updateRow(row._uid, 'nama', e.target.value)}
                placeholder="Nama siswa" style={inputStyle}
                onKeyDown={(e) => { if (e.key === 'Enter') addRow(); }}
              />
              <input value={row.rayon} onChange={(e) => updateRow(row._uid, 'rayon', e.target.value)} placeholder="Rayon" style={inputStyle} />
              <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {['L', 'P'].map((g) => (
                  <button key={g} onClick={() => updateRow(row._uid, 'gender', g)} style={{
                    flex: 1, border: 'none', padding: '6px 0', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    background: row.gender === g ? (g === 'L' ? '#1d4ed8' : '#be185d') : '#f8fafc',
                    color: row.gender === g ? '#fff' : '#94a3b8',
                  }}>{g}</button>
                ))}
              </div>
              <button onClick={() => removeRow(row._uid)} style={{
                background: 'none', border: 'none', color: rows.length > 1 ? '#fca5a5' : '#f1f5f9',
                cursor: rows.length > 1 ? 'pointer' : 'default', fontSize: 14, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>
          ))}

          <button onClick={addRow} style={{
            display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 14px',
            background: 'none', border: '1px dashed #cbd5e1', borderRadius: 9,
            padding: '8px 16px', color: '#94a3b8', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', width: '100%',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <span style={{ fontSize: 15 }}>+</span>
            Tambah baris
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 400, color: '#cbd5e1' }}>atau tekan Enter di kolom nama</span>
          </button>
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9,
            border: '1px solid #e2e8f0', background: '#fff', fontSize: 11, fontWeight: 700, color: '#64748b', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 13 }}>↑</span>
            Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>
            {filledCount > 0 ? `${filledCount} siswa siap disimpan` : 'Isi nama & rayon untuk mulai'}
          </span>
          <button onClick={handleClose} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#94a3b8', cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSimpan} style={{ background: '#10b981', border: 'none', borderRadius: 9, padding: '8px 18px', fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Simpan
            {filledCount > 0 && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{filledCount}</span>}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalPop { from{opacity:0;transform:scale(0.96) translateY(10px);} to{opacity:1;transform:scale(1) translateY(0);}}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}
      `}</style>
    </div>
  );
};

// ─── MODAL EDIT GRUP ──────────────────────────────────────────────────────────
const ModalEditGrup = ({ isOpen, grup, onClose, onRefresh }) => {
  const [editRows, setEditRows] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const lastInputRef = useRef(null);
  const [rombelBaru,setRombelBaru]= useState('');
  const [kelasEdit, setKelasEdit] = useState('');
const [rombelEdit, setRombelEdit] = useState('');
  useEffect(() => {
    if (isOpen && grup) {
          setKelasEdit(grup.kelas);
    setRombelEdit(grup.rombel);
      setEditRows(grup.students.map((s) => ({
        _id: s._id,
        _uid: s._id,
        nama: s.nama,
        rayon: s.rayon,
        gender: s.gender,
        _changed: false,
        _toDelete: false,
        
      })));
      setNewRows([]);
    }
  }, [isOpen, grup]);

  if (!isOpen || !grup) return null;

  const updateEdit = (uid, field, value) =>
    setEditRows((r) => r.map((x) => (x._uid === uid ? { ...x, [field]: value, _changed: true } : x)));

  const toggleDelete = (uid) =>
    setEditRows((r) => r.map((x) => (x._uid === uid ? { ...x, _toDelete: !x._toDelete } : x)));

  const addNewRow = () => {
    setNewRows((r) => [...r, makeRow()]);
    setTimeout(() => lastInputRef.current?.focus(), 60);
  };

  const removeNewRow = (uid) => setNewRows((r) => r.filter((x) => x._uid !== uid));

  const updateNew = (uid, field, value) =>
    setNewRows((r) => r.map((x) => (x._uid === uid ? { ...x, [field]: value } : x)));

  const handleSimpan = async () => {
    setSaving(true);
    try {
      // 1. UPDATE NAMA GRUP (kelas + rombel)
      if (kelasEdit !== grup.kelas || rombelEdit !== grup.rombel) {
        const rombelFix = rombelEdit.trim();
        if (!kelasEdit || !rombelFix) {
          setSaving(false);
          return Swal.fire('Oops', 'Kelas & rombel tidak boleh kosong', 'warning');
        }
        await api.patch('/absensi/group/update', {
          ids: grup.students.map(s => s._id),
          kelas: kelasEdit,
          rombel: rombelEdit,
        });
      }

      // 2. Hapus yang ditandai delete — BULK sekaligus
      const toDelete = editRows.filter((r) => r._toDelete);
      if (toDelete.length > 0) {
        await api.delete('/absensi/bulk', { data: { ids: toDelete.map((r) => r._id) } });
      }

      // 3. Update siswa yang di edit — tetap satu-satu (wajar, biasanya sedikit)
      const toUpdate = editRows.filter((r) => r._changed && !r._toDelete);
      for (const r of toUpdate) {
        await api.patch(`/absensi/${r._id}`, {
          nama: r.nama.trim(),
          rayon: r.rayon.trim(),
          gender: r.gender,
        });
      }

      // 4. Tambah siswa baru — BULK sekaligus
      const validNew = newRows.filter((r) => r.nama.trim() && r.rayon.trim());
      if (validNew.length > 0) {
        await api.post('/absensi/bulk', {
          rows: validNew.map((r) => ({
            nama: r.nama.trim(),
            kelas: kelasEdit,
            rombel: rombelEdit,
            rayon: r.rayon.trim(),
            gender: r.gender,
          })),
        });
      }

      Swal.fire({ icon: 'success', title: 'Tersimpan!', timer: 1400, showConfirmButton: false });
      await onRefresh();
      onClose();
    } catch {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeRows = editRows.filter((r) => !r._toDelete);
  const deletedCount = editRows.filter((r) => r._toDelete).length;
  const validNewCount = newRows.filter((r) => r.nama.trim() && r.rayon.trim()).length;
  const kc = KELAS_COLOR[grup.kelas] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(15,23,42,0.72)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)', animation: 'modalPop 0.18s ease',
      }}>
        {/* Header */}
        <div style={{ background: '#0f172a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: kc.bg, color: kc.text, padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
              Kelas {grup.kelas}
            </span>
            <div>
              <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>Edit Grup</p>
             <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  
  {/* SELECT KELAS */}
  <select
    value={kelasEdit}
    onChange={(e) => setKelasEdit(e.target.value)}
    style={{
      borderRadius: 6,
      padding: '4px 8px',
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    <option value="X">X</option>
    <option value="XI">XI</option>
    <option value="XII">XII</option>
  </select>

  {/* INPUT ROMBEL */}
  <input
    value={rombelEdit}
    onChange={(e) => setRombelEdit(e.target.value)}
    style={{
      borderRadius: 6,
      padding: '4px 8px',
      fontSize: 14,
      fontWeight: 800,
    }}
  />

</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#64748b', width: 30, height: 30, borderRadius: 8, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Info bar */}
        <div style={{ padding: '8px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            {activeRows.length} siswa aktif
          </span>
          {deletedCount > 0 && (
            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
              {deletedCount} akan dihapus
            </span>
          )}
          {validNewCount > 0 && (
            <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
              +{validNewCount} siswa baru
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {/* Header kolom */}
          <div style={{
            display: 'grid', gridTemplateColumns: '28px 1fr 120px 60px 80px',
            gap: 8, padding: '11px 0 6px', position: 'sticky', top: 0,
            background: '#fff', borderBottom: '1px solid #f1f5f9', zIndex: 1,
          }}>
            {['#', 'Nama Lengkap', 'Rayon', 'L/P', 'Aksi'].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {/* Siswa existing */}
          {editRows.map((row, idx) => (
            <div key={row._uid} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 120px 60px 80px',
              gap: 8, padding: '6px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center',
              opacity: row._toDelete ? 0.4 : 1,
              background: row._toDelete ? '#fff5f5' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600, textAlign: 'center' }}>{idx + 1}</span>
              <input
                value={row.nama} onChange={(e) => updateEdit(row._uid, 'nama', e.target.value)}
                placeholder="Nama siswa" style={{ ...inputStyle, textDecoration: row._toDelete ? 'line-through' : 'none' }}
                disabled={row._toDelete}
              />
              <input
                value={row.rayon} onChange={(e) => updateEdit(row._uid, 'rayon', e.target.value)}
                placeholder="Rayon" style={{ ...inputStyle, textDecoration: row._toDelete ? 'line-through' : 'none' }}
                disabled={row._toDelete}
              />
              <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {['L', 'P'].map((g) => (
                  <button key={g} onClick={() => !row._toDelete && updateEdit(row._uid, 'gender', g)} style={{
                    flex: 1, border: 'none', padding: '6px 0', fontSize: 11, fontWeight: 800,
                    cursor: row._toDelete ? 'default' : 'pointer',
                    background: row.gender === g ? (g === 'L' ? '#1d4ed8' : '#be185d') : '#f8fafc',
                    color: row.gender === g ? '#fff' : '#94a3b8',
                  }}>{g}</button>
                ))}
              </div>
              <button onClick={() => toggleDelete(row._uid)} style={{
                border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.1s',
                background: row._toDelete ? '#fef3c7' : '#fff1f2',
                color: row._toDelete ? '#92400e' : '#e11d48',
              }}>
                {row._toDelete ? 'Batal' : 'Hapus'}
              </button>
            </div>
          ))}

          {/* Divider tambah baru */}
          {newRows.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 6px' }}>
              <div style={{ flex: 1, height: 1, background: '#d1fae5' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Siswa Baru</span>
              <div style={{ flex: 1, height: 1, background: '#d1fae5' }} />
            </div>
          )}

          {/* Baris baru */}
          {newRows.map((row, idx) => (
            <div key={row._uid} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 120px 60px 80px',
              gap: 8, padding: '6px 0', borderBottom: '1px solid #f0fdf4', alignItems: 'center',
              background: '#f0fdf4', borderRadius: 8, margin: '3px 0',
            }}>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, textAlign: 'center' }}>+</span>
              <input
                ref={idx === newRows.length - 1 ? lastInputRef : null}
                value={row.nama} onChange={(e) => updateNew(row._uid, 'nama', e.target.value)}
                placeholder="Nama siswa baru" style={inputStyle}
                onKeyDown={(e) => { if (e.key === 'Enter') addNewRow(); }}
              />
              <input value={row.rayon} onChange={(e) => updateNew(row._uid, 'rayon', e.target.value)} placeholder="Rayon" style={inputStyle} />
              <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {['L', 'P'].map((g) => (
                  <button key={g} onClick={() => updateNew(row._uid, 'gender', g)} style={{
                    flex: 1, border: 'none', padding: '6px 0', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    background: row.gender === g ? (g === 'L' ? '#1d4ed8' : '#be185d') : '#f8fafc',
                    color: row.gender === g ? '#fff' : '#94a3b8',
                  }}>{g}</button>
                ))}
              </div>
              <button onClick={() => removeNewRow(row._uid)} style={{ border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#fff1f2', color: '#e11d48' }}>Hapus</button>
            </div>
          ))}

          <button onClick={addNewRow} style={{
            display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 14px',
            background: 'none', border: '1px dashed #a7f3d0', borderRadius: 9,
            padding: '8px 16px', color: '#10b981', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', width: '100%',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.background = 'none'; }}
          >
            <span style={{ fontSize: 15 }}>+</span>
            Tambah siswa ke grup ini
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>
            {deletedCount > 0 || validNewCount > 0
              ? `${deletedCount > 0 ? `${deletedCount} dihapus` : ''}${deletedCount > 0 && validNewCount > 0 ? ', ' : ''}${validNewCount > 0 ? `+${validNewCount} ditambah` : ''}`
              : 'Ubah data siswa di atas'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#94a3b8', cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSimpan} disabled={saving} style={{
            background: saving ? '#94a3b8' : '#10b981', border: 'none', borderRadius: 9,
            padding: '8px 18px', fontSize: 13, fontWeight: 800, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── GRUP CARD ────────────────────────────────────────────────────────────────
const GrupCard = ({ kelas, rombel, students, tanggal, filterGender, onToggleCheck, onHapus, onEdit, onExport,onDeleteGroup }) => {
  const [collapsed, setCollapsed] = useState(false);

  const shown = filterGender === 'Semua' ? students : students.filter((s) => s.gender === filterGender);
  const lCount = students.filter((s) => s.gender === 'L').length;
  const pCount = students.filter((s) => s.gender === 'P').length;
  const kc = KELAS_COLOR[kelas] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header grup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', userSelect: 'none' }}>
        {/* Klik untuk collapse */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}
        >
          <span style={{ background: kc.bg, color: kc.text, padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
            Kelas {kelas}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', flex: 1 }}>{rombel}</span>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{lCount} L</span>
            <span style={{ background: '#fce7f3', color: '#be185d', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{pCount} P</span>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{students.length}</span>
            {filterGender !== 'Semua' && (
              <span style={{ background: filterGender === 'L' ? '#1d4ed8' : '#be185d', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>
                Tampil: {filterGender === 'L' ? 'Laki' : 'Perempuan'} ({shown.length})
              </span>
            )}
          </div>

          <span style={{ fontSize: 11, color: '#cbd5e1', display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.18s' }}>▾</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onDeleteGroup} style={{
            background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 12px',
            fontSize: 11, fontWeight: 700, color: '#dc2626', cursor: 'pointer',
          }}>
            🗑️ Hapus Grup
          </button>
          <button onClick={onEdit} style={{
            background: '#ede9fe', border: 'none', borderRadius: 8, padding: '6px 12px',
            fontSize: 11, fontWeight: 700, color: '#5b21b6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#ddd6fe'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ede9fe'}
          >
            ✏️ Edit Grup
          </button>
          <button onClick={onExport} style={{
            background: '#d1fae5', border: 'none', borderRadius: 8, padding: '6px 12px',
            fontSize: 11, fontWeight: 700, color: '#065f46', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#a7f3d0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#d1fae5'}
          >
            ↓ Excel
          </button>
        </div>
      </div>

      {/* Tabel siswa */}
      {!collapsed && (
        <div style={{ overflowX: 'auto', borderTop: '1px solid #f8fafc' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ ...thBase, textAlign: 'center', width: 36 }}>No</th>
                <th style={thBase}>Nama</th>
                <th style={thBase}>Rayon</th>
                <th style={{ ...thBase, textAlign: 'center', width: 44 }}>L/P</th>
                {tanggal.map((tgl, i) => (
                  <th key={i} style={{ ...thBase, textAlign: 'center', width: 56, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <span>H{i + 1}</span>
                      {tgl && <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>{formatTanggal(tgl)}</span>}
                    </div>
                  </th>
                ))}
                <th style={{ ...thBase, textAlign: 'center', width: 48 }}>Hapus</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: 20, color: '#cbd5e1', fontSize: 12, fontStyle: 'italic' }}>
                    Tidak ada siswa {filterGender !== 'Semua' ? `(${filterGender === 'L' ? 'laki-laki' : 'perempuan'}) ` : ''}di rombel ini
                  </td>
                </tr>
              ) : (
                shown.map((item, i) => (
                  <tr key={item._id} style={{ borderTop: '1px solid #f8fafc' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: '#cbd5e1', fontWeight: 600, fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: '#1e293b' }}>{item.nama}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{item.rayon}</span>
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}><GenderBadge val={item.gender} /></td>
                    {item.absensi.map((val, h) => (
                      <td key={h} style={{ textAlign: 'center', padding: '9px 6px' }}>
                        <input type="checkbox" checked={val} onChange={() => onToggleCheck(item._id, h)}
                          style={{ width: 15, height: 15, accentColor: '#10b981', cursor: 'pointer' }} />
                      </td>
                    ))}
                    <td style={{ textAlign: 'center', padding: '9px 10px' }}>
                      <button onClick={() => onHapus(item._id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 13, padding: 4, borderRadius: 5 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#fca5a5'}
                      >✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── KOMPONEN UTAMA ───────────────────────────────────────────────────────────
export default function AdminAbsensi() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTanggalOpen, setIsTanggalOpen] = useState(false);
  const [editGrup, setEditGrup] = useState(null);

  const [tanggal, setTanggal] = useState(DEFAULT_TANGGAL);

  const [filterKelas, setFilterKelas] = useState('Semua');
  const [searchRombel, setSearchRombel] = useState('');
  const [filterGender, setFilterGender] = useState('Semua');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/absensi');
      setAllData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ── TAMBAH SISWA — pakai bulk, 1 request saja ─────────────────────────────
  const handleSimpan = async ({ kelas, rombel, rows }) => {
    Swal.fire({ title: `Menyimpan ${rows.length} siswa...`, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const payload = rows.map((row) => ({
        nama: row.nama.trim(), kelas, rombel: rombel.trim(),
        rayon: row.rayon.trim(), gender: row.gender,
      }));
      const res = await api.post('/absensi/bulk', { rows: payload });
      Swal.fire({ icon: 'success', title: 'Tersimpan!', text: `${res.data.count} siswa ditambahkan ke ${rombel}.`, timer: 1800, showConfirmButton: false });
      setIsModalOpen(false);
      fetchData();
    } catch {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
    }
  };

  // ── IMPORT EXCEL — pakai bulk, 1 request saja ─────────────────────────────
 const handleImportExcel = async (data) => {
  Swal.fire({ title: 'Mengimpor...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    // 1. Bersihin data
    const cleaned = data.filter(item => item.nama && item.nama !== 'nama');

    // 2. Acak data (Fisher-Yates shuffle)
    const shuffled = [...cleaned];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Bagi jadi beberapa grup (misal 2 grup)
    const chunkSize = Math.ceil(shuffled.length / 2);
    const groups = [];

    for (let i = 0; i < shuffled.length; i += chunkSize) {
      groups.push(shuffled.slice(i, i + chunkSize));
    }

    let total = 0;

    // 4. Kirim per grup
    for (let i = 0; i < groups.length; i++) {
      const payload = groups[i].map(item => ({
        nama: item.nama,
        kelas: String(item.kelas || 'xi'),
        rombel: item.rombel || 'PPLG XI-1',
        rayon: item.rayon,
        gender: item.gender || item['L/P'] || 'L',
        grup: `Grup ${i + 1}` // 🔥 penanda grup
      }));

      const res = await api.post('/absensi/bulk', { rows: payload });
      total += res.data.count;
    }

    Swal.fire({
      icon: 'success',
      title: 'Sukses!',
      text: `${total} siswa berhasil diacak & dibagi grup.`,
      timer: 2000,
      showConfirmButton: false,
    });

    setIsModalOpen(false);
    fetchData();

  } catch (err) {
    Swal.fire('Error', 'Gagal mengimpor data.', 'error');
  }
};

  const toggleCheck = async (id, indexHari) => {
    try {
      await api.patch(`/absensi/${id}/check`, { indexHari });
      setAllData((prev) => prev.map((item) => {
        if (item._id !== id) return item;
        const newAbs = [...item.absensi];
        newAbs[indexHari] = !newAbs[indexHari];
        return { ...item, absensi: newAbs };
      }));
    } catch (err) { console.error(err); }
  };

  const handleHapus = async (id) => {
    const res = await Swal.fire({ title: 'Hapus siswa ini?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal', confirmButtonColor: '#ef4444' });
    if (res.isConfirmed) { await api.delete(`/absensi/${id}`); fetchData(); }
  };

  // ── EXPORT EXCEL ──────────────────────────────────────────────────────────
  const exportExcelGrup = (grup) => {
    const headers = ['No', 'Nama', 'Rayon', 'L/P',
      ...tanggal.map((t, i) => t ? `H${i + 1} (${formatTanggal(t)})` : `H${i + 1}`)
    ];
    const rows = grup.students.map((s, i) => [
      i + 1, s.nama, s.rayon, s.gender,
      ...s.absensi.map((v) => (v ? '✓' : '')),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${grup.kelas}-${grup.rombel}`);
    XLSX.writeFile(wb, `Absensi_${grup.kelas}_${grup.rombel}.xlsx`);
  };

  const exportExcelSemua = () => {
    const wb = XLSX.utils.book_new();
    const headers = ['No', 'Kelas', 'Rombel', 'Nama', 'Rayon', 'L/P',
      ...tanggal.map((t, i) => t ? `H${i + 1} (${formatTanggal(t)})` : `H${i + 1}`)
    ];
    const rows = allData.map((s, i) => [
      i + 1, s.kelas, s.rombel, s.nama, s.rayon, s.gender,
      ...s.absensi.map((v) => (v ? '✓' : '')),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Semua Siswa');
    XLSX.writeFile(wb, 'Absensi_Semua.xlsx');
  };

  // ── FILTER GRUP ───────────────────────────────────────────────────────────
  const allGroups = groupByKelasRombel(allData);
  const visibleGroups = allGroups.filter((g) => {
    if (filterKelas !== 'Semua' && g.kelas !== filterKelas) return false;
    if (searchRombel.trim() && !g.rombel.toLowerCase().includes(searchRombel.toLowerCase())) return false;
    return true;
  });

  const visibleStudents = visibleGroups.flatMap((g) => g.students);
  const totalL = visibleStudents.filter((s) => s.gender === 'L').length;
  const totalP = visibleStudents.filter((s) => s.gender === 'P').length;
  const shownCount = filterGender === 'Semua'
    ? visibleStudents.length
    : visibleStudents.filter((s) => s.gender === filterGender).length;

  const tanggalDiatur = tanggal.filter(Boolean).length;

  // ── HAPUS GRUP — pakai bulk, 1 request saja ───────────────────────────────
  const handleHapusGrup = async (grup) => {
    const res = await Swal.fire({
      title: `Hapus semua siswa di ${grup.rombel}?`,
      text: `Total ${grup.students.length} siswa akan dihapus permanen`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Hapus Semua', cancelButtonText: 'Batal', confirmButtonColor: '#ef4444',
    });
    if (!res.isConfirmed) return;

    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const ids = grup.students.map((s) => s._id);
      await api.delete('/absensi/bulk', { data: { ids } });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Grup ${grup.rombel} dihapus`, timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire('Error', 'Gagal menghapus grup', 'error');
    }
  };

  const handleDeleteAll = async () => {
  const confirm = await Swal.fire({
    title: 'Hapus SEMUA data?',
    text: 'Semua siswa dari semua rombel akan dihapus!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus semua!',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  });

  if (!confirm.isConfirmed) return;

  // 🔒 optional keamanan ekstra
  const confirm2 = await Swal.fire({
    title: 'Konfirmasi terakhir',
    text: 'Ketik HAPUS untuk melanjutkan',
    input: 'text',
    inputPlaceholder: 'HAPUS',
    showCancelButton: true,
  });

  if (confirm2.value !== 'HAPUS') return;

  try {
    Swal.fire({
      title: 'Menghapus semua data...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await api.delete('/absensi/all');

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `${res.data.count} data berhasil dihapus.`,
      timer: 2000,
      showConfirmButton: false,
    });

    fetchData();
  } catch (err) {
    Swal.fire('Error', 'Gagal menghapus semua data.', 'error');
  }
};

  return (
    <div style={{ padding: '24px 20px', maxWidth: 980, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: '#0f172a' }}>Manajemen Siswa</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Kelola data & absensi harian per grup kelas</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
  onClick={handleDeleteAll}
  style={{
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 11,
    padding: '9px 16px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  }}
>
  🗑️ Hapus Semua
</button>
          {/* Atur Tanggal */}
          <button onClick={() => setIsTanggalOpen(true)} style={{
            background: tanggalDiatur > 0 ? '#ede9fe' : '#f8fafc',
            color: tanggalDiatur > 0 ? '#5b21b6' : '#64748b',
            border: '1px solid', borderColor: tanggalDiatur > 0 ? '#c4b5fd' : '#e2e8f0',
            borderRadius: 11, padding: '9px 16px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            📅 Atur Tanggal
            {tanggalDiatur > 0 && (
              <span style={{ background: '#6366f1', color: '#fff', borderRadius: 5, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>
                {tanggalDiatur}/5
              </span>
            )}
          </button>

          {/* Export Semua */}
          <button onClick={exportExcelSemua} style={{
            background: '#f0fdf4', color: '#065f46', border: '1px solid #a7f3d0',
            borderRadius: 11, padding: '9px 16px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ↓ Export Semua
          </button>

          {/* Tambah Siswa */}
          <button onClick={() => setIsModalOpen(true)} style={{
            background: '#10b981', color: '#fff', border: 'none', borderRadius: 11,
            padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 3px 12px rgba(16,185,129,0.28)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Banner tanggal jika sudah diatur */}
      {tanggalDiatur > 0 && (
        <div style={{
          background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10,
          padding: '10px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#5b21b6', flexShrink: 0 }}>📅 Jadwal Absensi:</span>
          {tanggal.map((t, i) => (
            <span key={i} style={{
              background: t ? '#6366f1' : '#e2e8f0',
              color: t ? '#fff' : '#94a3b8',
              padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
            }}>
              H{i + 1}{t ? ` · ${formatTanggal(t)}` : ' · –'}
            </span>
          ))}
          <button onClick={() => setIsTanggalOpen(true)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6366f1', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Ubah ›
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div style={{
        background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12,
        padding: '11px 14px', marginBottom: 14,
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 160 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>⌕</span>
          <input value={searchRombel} onChange={(e) => setSearchRombel(e.target.value)} placeholder="Cari rombel..." style={{ ...inputStyle, paddingLeft: 26 }} />
        </div>

        <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Kelas</option>
          <option value="X">Kelas X</option>
          <option value="XI">Kelas XI</option>
          <option value="XII">Kelas XII</option>
        </select>

        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { val: 'Semua', label: 'L + P' },
            { val: 'L', label: 'Laki saja' },
            { val: 'P', label: 'Perempuan saja' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFilterGender(val)} style={{
              border: 'none', padding: '7px 13px', fontSize: 11, fontWeight: 800, cursor: 'pointer',
              background: filterGender === val ? (val === 'L' ? '#1d4ed8' : val === 'P' ? '#be185d' : '#0f172a') : '#f8fafc',
              color: filterGender === val ? '#fff' : '#94a3b8',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 800 }}>{totalL} L</span>
          <span style={{ background: '#fce7f3', color: '#be185d', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 800 }}>{totalP} P</span>
          {filterGender !== 'Semua' && (
            <span style={{ background: filterGender === 'L' ? '#1d4ed8' : '#be185d', color: '#fff', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 800 }}>Tampil {shownCount}</span>
          )}
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700 }}>{visibleGroups.length} rombel</span>
        </div>
      </div>

      {/* MODALS */}
      <ModalTanggal isOpen={isTanggalOpen} tanggal={tanggal} onSimpan={setTanggal} onClose={() => setIsTanggalOpen(false)} />
      <ModalTambah isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSimpan={handleSimpan} onImportExcel={handleImportExcel} />
      <ModalEditGrup
        isOpen={!!editGrup}
        grup={editGrup}
        onClose={() => setEditGrup(null)}
        onRefresh={fetchData}
      />

      {/* GRUP CARDS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: 13, fontStyle: 'italic' }}>Memuat data...</div>
      ) : visibleGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: 13, background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9' }}>
          {searchRombel ? `Rombel "${searchRombel}" tidak ditemukan` : 'Tidak ada data'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleGroups.map((g) => (
            <GrupCard
              key={`${g.kelas}-${g.rombel}`}
              kelas={g.kelas}
              rombel={g.rombel}
              students={g.students}
              tanggal={tanggal}
              filterGender={filterGender}
              onToggleCheck={toggleCheck}
              onHapus={handleHapus}
              onEdit={() => setEditGrup(g)}
              onExport={() => exportExcelGrup(g)}
              onDeleteGroup={() => handleHapusGrup(g)}
            />
          ))}
        </div>
      )}
    </div>
  );
}