import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useColor } from "color-thief-react";
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { FaSpotify } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import MoreHorizontal from '@mui/icons-material/MoreHoriz';
import Volume from '@mui/icons-material/VolumeUp'; 
import User from '@mui/icons-material/AccountCircle';



function PlayerControls({ isPlaying, setIsPlaying, handlePrevious, handleNext }) {
  return (
    <div>
      <button onClick={handlePrevious}>
        <SkipPreviousIcon fontSize="large" />
      </button>

      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
      </button>

      <button onClick={handleNext}>
        <SkipNextIcon fontSize="large" />
      </button>
    </div>
  );
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const SingerList = () => {
  const [songs, setSongs] = useState([]);
  const [durations, setDurations] = useState({});
  const [search, setSearch] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTab, setSelectedTab] = useState("For You");
  const [volume, setVolume] = useState(1); 
  const [bgColor, setBgColor] = useState("#000000");

  // Extract dominant color using useColor hook
  const { data: dominantColor } = useColor(
    currentSong ? `https://cms.samespace.com/assets/${currentSong.cover}` : null,
    "rgbArray",
    {
      crossOrigin: "anonymous",
      quality: 8,
    }
  );

  useEffect(() => {
    if (dominantColor) {
      const darkenedColor = dominantColor.map(channel => Math.max(0, channel * 0.8));
      setBgColor(`rgb(${darkenedColor.join(",")})`);
      
      document.body.style.transition = "background-color 0.5s ease";
      document.body.style.backgroundColor = `rgb(${darkenedColor.join(",")})`;
    }
  }, [dominantColor]);

  // Clean up the body background when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.transition = "";
    };
  }, []);

  const handleSongClick = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentIndex < filteredSongs.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(filteredSongs[nextIndex]);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSong(filteredSongs[prevIndex]);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    axios.get("https://cms.samespace.com/items/songs").then((res) => {
      setSongs(res.data.data);
    });
  }, []);

  useEffect(() => {
    songs.forEach((song) => {
      const audio = new Audio(song.url);
      audio.addEventListener("loadedmetadata", () => {
        setDurations((prev) => ({
          ...prev,
          [song.id]: audio.duration,
        }));
      });
    });
  }, [songs]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = (song.title + song.artist + song.name)
      .toLowerCase()
      .includes(search.toLowerCase());

    if (selectedTab === "Top Tracks") {
      return matchesSearch && song.isTopTrack;
    }

    return matchesSearch;
  });

  return (
    <div
      className="main-container"
      style={{
        backgroundColor: bgColor
      }}
    >
      <div className="spotify-container">
        <div className="spotify-tabs" >
          <span><FaSpotify size={28}/></span>
          <span >Spotify</span>
        </div>
        <div className="user-icon" style={{marginTop: "520px"}}>
          <User size={24} color="#FFFFFF" />
        </div>
      </div>


      <div className="song-list-container">
        <div className="tabs">
          <span
            className={selectedTab === "For You" ? "active" : ""}
            onClick={() => setSelectedTab("For You")}
          >
            For You
          </span>
          <span
            className={selectedTab === "Top Tracks" ? "active" : ""}
            onClick={() => setSelectedTab("Top Tracks")}
          >
            Top Tracks
          </span>
        </div>
        <div className="search-container">
          <input
            className="search-bar"
            placeholder="Search Song"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>

        {filteredSongs.length === 0 && selectedTab === "Top Tracks" ? (
          <p style={{ textAlign: "center", padding: "1rem", color: "#888" }}>
            No top tracks available
          </p>
        ) : (
          <ul className="song-list">
            {filteredSongs.map((song, index) => (
              <li
                key={song.id}
                className={`song-item ${currentSong && currentSong.id === song.id ? 'active' : ''}`}
                onClick={() => handleSongClick(song, index)}
              >
                <img
                  src={`https://cms.samespace.com/assets/${song.cover}`}
                  alt={song.title}
                  className="song-image"
                />
                <div className="song-info">
                  <p id="song-name">{song.name}</p>
                  <p>{song.artist}</p>
                </div>
                <span className="duration">
                  {durations[song.id]
                    ? formatDuration(durations[song.id])
                    : "00:00"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {currentSong && (
        <div
          className="player-box"
        >
          <h2>{currentSong.name}</h2>
          <p className="artist">{currentSong.artist}</p>
          <img
            src={`https://cms.samespace.com/assets/${currentSong.cover}`}
            alt={currentSong.title}
            className="player-art"
          />

          <div className="controls">
            <input
              type="range"
              min="0"
              max={duration}
              value={progress}
              onChange={(e) => {
                const seekTime = Number(e.target.value);
                audioRef.current.currentTime = seekTime;
                setProgress(seekTime);
              }}
              className="progress-bar"
            />
            <div className="time-display">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="player-control">
              <button style={{ background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',}}
              >
                <MoreHorizontal size={20} />
              </button>
              <PlayerControls
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
              />
              <button style={{background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',}}
              >
                <Volume size={20} />
              </button>
            </div>
          </div>

          <audio ref={audioRef} src={currentSong.url} />
        </div>
      )}
    </div>
  );
};

export default SingerList;