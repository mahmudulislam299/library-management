import React, { useState } from 'react';
import './PhotoGallery.css';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png",
    "lib.png"
  ];

  const openLightbox = (imgSrc) => setSelectedImage(imgSrc);
  const closeLightbox = () => setSelectedImage(null);

  return (
    <section className="photogallery-container">
      <h2 className="photogallery-title">Photo Gallery</h2>
      
      <div className="photogallery-grid">
        {images.map((src, index) => (
          <div 
            key={index} 
            className="gallery-item"
            onClick={() => openLightbox(src)}
          >
            <img src={src} alt={`Library ${index + 1}`} />
            <div className="gallery-overlay">
              <span className="view-btn">View</span>
            </div>
          </div>
        ))}
      </div>

      <button className="view-more-btn">
        VIEW MORE <ArrowForwardIosIcon style={{ fontSize: 20, marginLeft: 8 }} />
      </button>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full view" />
            <button className="lightbox-close" onClick={closeLightbox}>
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default PhotoGallery;