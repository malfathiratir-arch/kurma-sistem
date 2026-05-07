import React ,{useEffect,useState}from "react";
import api from "../../utils/api";



const AdminGuestApp = () => {
    //state untuk menampung daftar pengurus
    const [ListPengurus, setListPengurus] = useState ([]);
    //untuk menangkap input
    const [nama,setNama] = useState('');
    const [jabatan,setJabatan] = useState ('Ketua');//default opsi
    const [foto,setFoto] = useState(null);

    //fungi untuk handle foto dan konfersike url preview
    const handleFoto = (e) => {
        const file = e.target.files[0];
        if (file){
            setFoto(URL.createObjectURL(file));
        }
    };

    //fungis saat tombeol di simpan di kliik
    const tambahData = (e) => {
        e.preventDefault();

        //gabungan input jadi satu object baru
        const dataBaru = {nama,jabatan,foto};

        //masukan ke dalam array llist pengurus
        setListPengurus([...ListPengurus,dataBaru]);

        //reset input setelah klik simpan
        setNama('');
        setFoto(null);

    };
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
       <section style={{ marginBottom: '40px', border:'1px solid #add', padding:'20px' }}>
        <h2>Form pengurus</h2>
        <form action="" onSubmit={tambahData}>
            <div style={{ marginBottom:'10px' }}>
                <label htmlFor="">Nama:</label><br />
                <input type="text" value={nama} onChange={(e) =>setNama (e.target.value)} required />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>jabatan</label><br />
                <select value={jabatan} onChange={(e) => setJabatan(e.target.value)}>
                    <option value="Ketua">ketua</option>
                    <option value="Wakil Ketua">Wakil Ketua</option>
                    <option value="Sekretaris">Sekretaris</option>
                </select>
            </div>
            <div style={{ marginBottom:'10px' }}>
                <label htmlFor="">Foto</label><br />
                <input type="file" accept="image/*" onChange={handleFoto} required />

            </div>
            <button type="submit"  style={{ cursor:'pointer' }}>simpan data</button>
        </form>
       </section>
       <hr />
       <section>
        <h2>Halaman Guest (tampilan)</h2>
        <div style={{ display:'flex' ,gap:'15px', flexWrap:'wrap' }}>
            {ListPengurus.length === 0 ? <p>belum ada data.</p>:
            ListPengurus.map((item,index)=>(
                <div key={index} style={{ 
                    width:'150px',
                    border:'1px solid #eee',
                    textAlign:'center',
                    padding:'10px',
                    borderRadius:'8px',
                    boxShadow:'0 2px 5px rgba(0,0,0,0.1)'
                 }}>
                    <img src={item.foto} alt="Foto" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <p style={{ fontWeight: 'bold', margin: '10px 0 5px' }}>{item.nama}</p>
                <span style={{ fontSize: '0.8em', color: '#666', background: '#f0f0f0', padding: '2px 8px' }}>
                  {item.jabatan}
                </span>
                 </div>
            ))
            }
            
        </div>
       </section>
    </div>
);
};

export default AdminGuestApp;