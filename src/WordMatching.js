import React, { useState } from 'react';

const books = [
  {
    title: 'پانی ہی پانی',
    author: 'روی پرانجے',
    src: 'https://archive.org/embed/pani-hee-pani-ravi-paranjpe-nbt',
  },
  {
    title: 'عقل مند اور چالاک',
    author: 'کالا تھارانی',
    src: 'https://archive.org/embed/akalmand-aur-chalak-kala-tharani-nbt',
  },
  {
    title: 'تین بھالو',
    author: 'ٹالسٹائی',
    src: 'https://archive.org/embed/teen-bhalu-urdu-tolstoy',
  },
  {
    title: 'میں بنا سکتا ہوں',
    author: 'منی سرینی واسن',
    src: 'https://archive.org/embed/56547-mein-bana-sakta-hun',
  },
  {
    title: 'سنو کہانی',
    author: 'منصور نقوی',
    src: 'https://archive.org/embed/suno-kahani-mansoor-naqvi',
  },
  {
    title: 'انوکھی دکان',
    author: 'NBT',
    src: 'https://archive.org/embed/AnuthiDukan-Urdu-ChildrensBook',
  },
  {
    title: 'اڑنے والا گینڈا',
    author: 'منور جعفٰی',
    src: 'https://archive.org/embed/udne-vala-genda-munawwar-jafa',
  },
  {
    title: 'ڈھولک',
    author: 'پروین سید',
    src: 'https://archive.org/embed/225332-dholak',
  },
];

export default function Kitabain() {
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div style={{ padding: '10px', fontFamily: 'Jameel Noori Nastaleeq', alignContent:'center'}} >
      <h1 style={{ textAlign: 'center', fontSize: '40px' ,     
      borderRadius: '15px',
    textShadow: '2px 2px 5px rgba(0, 0, 0, 0.8)',
    marginBottom: '10px',padding: '5px 20px',color: '#ffffff'
}}>کتابیں</h1>

  {/* style={{
    fontFamily: "'Jameel Noori Nastaleeq'",
    fontSize: '50px',
    
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  }} */}


      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px',
      }}>
        {books.map((book, index) => (
          <div
            key={index}
            onClick={() => setSelectedBook(book)}
            style={{
              cursor: 'pointer',
              background: '#f7f7f7',
              padding: '8px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '300px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <iframe
              src={book.src}
              width="100%"
              height="180"
              title={book.title}
              style={{ borderRadius: '6px', border: 'none' }}
            ></iframe>
            <div style={{ fontSize: '20px', marginTop: '6px' }}>{book.title}</div>
            <div style={{ fontSize: '16px', color: '#666' }}>{book.author}</div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div
          onClick={() => setSelectedBook(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '5vw',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '720px',
              height: '90vh',
              backgroundColor: '#fff',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{
              padding: '10px',
              textAlign: 'center',
              fontSize: '24px',
              backgroundColor: '#f0f0f0',
              borderBottom: '1px solid #ccc',
            }}>
              {selectedBook.title}
            </div>
            <iframe
              src={selectedBook.src}
              style={{
                flexGrow: 1,
                width: '100%',
                border: 'none',
              }}
              allowFullScreen
              title={selectedBook.title}
            ></iframe>
            <button
              onClick={() => setSelectedBook(null)}
              style={{
                background: '#444',
                color: '#fff',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              بند کریں
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
