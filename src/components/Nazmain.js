import React, { useState } from 'react';
import nazmainData from '../Data/nazmainData.json';
import '../Kahaniyan.css';

function Nazmain() {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState('');

    const openVideo = (videoUrl, videoTitle) => {
        const videoId = videoUrl.split('v=')[1];
        const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`;
        setSelectedVideo(embedUrl);
        setSelectedTitle(videoTitle);
    };

    const closeVideo = () => {
        setSelectedVideo(null);
        setSelectedTitle('');
    };

    return (
        <div className="kahaniyan">
            <h1>نظمیں</h1>
            <div className="video-list">
                {nazmainData.map((video, index) => {
                    const videoId = video.url.split('v=')[1];
                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                    return (
                        <div 
                            className="video-thumbnail" 
                            key={index} 
                            onClick={() => openVideo(video.url, video.title)}
                        >
                            <h3 className="video-title">{video.title}</h3>
                            <img src={thumbnailUrl} alt={video.title} />
                        </div>
                    );
                })}
            </div>

            {selectedVideo && (
                <div className="video-popup" onClick={closeVideo}>
                    <div className="video-popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeVideo}>✖</button>
                        <h2 className="popup-title">{selectedTitle}</h2>
                        <iframe
                            width="100%"
                            height="600"
                            src={selectedVideo}
                            title="Video Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation-by-user-activation"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Nazmain;
