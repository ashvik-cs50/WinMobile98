import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Wifi, Battery, Volume2, VolumeX, Folder, 
  Terminal, Settings as SettingsIcon, Play, Square, X, Minus, ChevronUp, 
  Grid, Home, RefreshCw, AlertTriangle, Send, Smile, Image as ImageIcon,
  Clock, Calendar, Cpu, HardDrive, Smartphone, Sparkles, Gamepad2, Music,
  Globe, Shield, Lock, Palette, SmartphoneNfc, Bell, CpuIcon, Check, ArrowLeft, ArrowRight,
  Calculator as CalcIcon, FileText, Image, Shuffle, Radio, Save, Trash2, Plus
} from 'lucide-react';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(96);
  const [timeStr, setTimeStr] = useState('');
  const [wifiSignal, setWifiSignal] = useState(true);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wallpaper, setWallpaper] = useState('#008080');

  const [activeWindows, setActiveWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

  const [fileSystem, setFileSystem] = useState(() => {
    try {
      const saved = localStorage.getItem('win98_mobile_fs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse cache filesystem", e);
    }
    return [
      { id: '1', name: 'welcome.txt', content: 'Welcome to Windows 98 Mobile Ultimate!\nYour files are stored in browser cache.', type: 'txt' },
      { id: '2', name: 'todo.txt', content: '- Explore Minesweeper\n- Test Google Search in IE\n- Create new cached files', type: 'txt' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('win98_mobile_fs', JSON.stringify(fileSystem));
    } catch (e) {
      console.error("Failed to save filesystem", e);
    }
  }, [fileSystem]);

  const desktopIcons = [
    { id: 'my-computer', name: 'My Computer', icon: HardDrive, app: 'computer' },
    { id: 'internet-explorer', name: 'IE 5.0 / Google', icon: Globe, app: 'browser' },
    { id: 'file-manager', name: 'File Cache', icon: Folder, app: 'filesystem' },
    { id: 'minesweeper', name: 'Minesweeper', icon: Gamepad2, app: 'minesweeper' },
    { id: 'solitaire', name: 'Solitaire 98', icon: Shuffle, app: 'solitaire' },
    { id: 'calculator', name: 'Calculator', icon: CalcIcon, app: 'calculator' },
    { id: 'winamp', name: 'Winamp 98', icon: Music, app: 'winamp' },
    { id: 'paint', name: 'MS Paint', icon: ImageIcon, app: 'paint' },
    { id: 'notepad', name: 'Notepad', icon: FileText, app: 'notepad' },
    { id: 'photos', name: 'Photo Gallery', icon: Image, app: 'photos' },
    { id: 'settings', name: 'Control Panel', icon: SettingsIcon, app: 'settings' },
    { id: 'clippy', name: 'Ask Clippy', icon: Smile, app: 'clippy' }
  ];

  const playSound = (type) => {
    if (!soundEnabled || isMuted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      if (type === 'startup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(196, now);
        osc.frequency.setValueAtTime(261.63, now + 0.3);
        osc.frequency.setValueAtTime(329.63, now + 0.6);
        osc.frequency.setValueAtTime(392, now + 0.9);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        osc.start(now);
        osc.stop(now + 2.2);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    }, 1000);

    if (booting) {
      const stepTimer = setTimeout(() => {
        if (bootStep < 4) {
          setBootStep(bootStep + 1);
        } else {
          setBooting(false);
          playSound('startup');
        }
      }, 700);
      return () => clearTimeout(stepTimer);
    }

    return () => clearInterval(timer);
  }, [booting, bootStep]);

  const openApp = (appId, title, customProps = {}) => {
    playSound('click');
    setIsStartOpen(false);
    setIsQuickSettingsOpen(false);

    const existing = activeWindows.find(w => w.id === appId);
    if (existing) {
      setActiveWindowId(appId);
      if (minimizedWindows.includes(appId)) {
        setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
      }
      return;
    }

    const newWindow = {
      id: appId,
      title: title || appId,
      zIndex: activeWindows.length + 1,
      props: customProps
    };

    setActiveWindows([...activeWindows, newWindow]);
    setActiveWindowId(appId);
  };

  const closeWindow = (id) => {
    playSound('click');
    setActiveWindows(activeWindows.filter(w => w.id !== id));
    setMinimizedWindows(minimizedWindows.filter(i => i !== id));
    if (activeWindowId === id) {
      const remaining = activeWindows.filter(w => w.id !== id);
      if (remaining.length > 0) {
        setActiveWindowId(remaining[remaining.length - 1].id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id) => {
    playSound('click');
    setMinimizedWindows([...minimizedWindows, id]);
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const focusWindow = (id) => {
    setActiveWindowId(id);
    if (minimizedWindows.includes(id)) {
      setMinimizedWindows(minimizedWindows.filter(i => i !== id));
    }
    const maxZ = Math.max(...activeWindows.map(w => w.zIndex), 0);
    setActiveWindows(activeWindows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
  };

  if (booting) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-black text-white font-mono select-none overflow-hidden">
        <div className="w-full max-w-sm p-6 flex flex-col items-center">
          <div className="text-center mb-6">
            <div className="text-3xl font-black tracking-widest text-cyan-400 mb-1 font-sans">Microsoft</div>
            <div className="text-xl font-bold tracking-wider text-white">Windows<span className="text-red-500 font-serif">98</span> <span className="text-[10px] bg-blue-700 px-1 py-0.5 rounded text-white align-top">ULTIMATE MOBILE</span></div>
          </div>

          <div className="w-full bg-gray-950 border-2 border-gray-700 p-4 rounded shadow-inner mb-6 text-xs space-y-1.5 font-mono">
            <div className="text-green-400 flex items-center gap-2">
              <span>&gt;</span> Award Modular BIOS v4.61 Mobile
            </div>
            <div className="text-gray-300 text-[11px] space-y-1">
              {bootStep >= 0 && <div>CPU: AMD K6-III Mobile @ 450MHz [OK]</div>}
              {bootStep >= 1 && <div>Mounting Local Storage Cache (Indexed / LocalStorage)... [OK]</div>}
              {bootStep >= 2 && <div>128MB High Memory Installed & Tested [OK]</div>}
              {bootStep >= 3 && <div>Loading Active Desktop & Touch Subsystem... [OK]</div>}
              {bootStep >= 4 && <div className="text-cyan-300 font-bold animate-pulse">Starting Windows 98 Mobile...</div>}
            </div>
          </div>

          <div className="w-full bg-gray-900 h-3 border border-gray-600 p-0.5 rounded overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 shadow" 
              style={{ width: `${(bootStep + 1) * 20}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full sm:w-[412px] sm:h-[840px] sm:rounded-[3rem] sm:border-[10px] sm:border-[#222] overflow-hidden font-sans select-none flex flex-col justify-between shadow-2xl bg-teal-800" style={{ backgroundColor: wallpaper }}>
      
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#c0c0c0] border-b-2 border-white flex items-center justify-between px-3 text-xs text-black z-40 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold cursor-pointer" onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}>
          <span className="bg-[#000080] text-white px-1.5 py-0.5 rounded-sm text-[10px] tracking-tight">Win98</span>
          <span className="truncate max-w-[120px]">
            {activeWindowId ? activeWindows.find(w => w.id === activeWindowId)?.title : 'Mobile Desktop'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[10px] text-gray-800">
            {isMuted ? <VolumeX size={12} className="text-red-700"/> : <Volume2 size={12}/>}
            <span>{volume}%</span>
          </div>
          <Wifi size={12} className={wifiSignal ? 'text-black' : 'text-gray-400'} />
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <Battery size={12} className="text-green-700" />
            <span>{batteryLevel}%</span>
          </div>
          <span className="font-mono text-[11px] font-semibold">{timeStr}</span>
        </div>
      </div>

      {/* Desktop Grid Area */}
      <div 
        className="flex-1 relative mt-7 mb-10 overflow-y-auto p-3 grid grid-cols-3 gap-3 content-start"
        onClick={() => { setIsStartOpen(false); setIsQuickSettingsOpen(false); }}
      >
        {desktopIcons.map((icon) => {
          const IconComponent = icon.icon;
          return (
            <div
              key={icon.id}
              onDoubleClick={() => openApp(icon.app, icon.name)}
              onClick={() => openApp(icon.app, icon.name)}
              className="flex flex-col items-center justify-center p-2 rounded hover:bg-white/25 active:bg-blue-800/40 cursor-pointer group text-center transition-transform active:scale-95"
            >
              <div className="w-11 h-11 bg-[#000080] rounded-lg flex items-center justify-center text-white mb-1 shadow-md group-hover:scale-105 transition-transform border border-white/50">
                <IconComponent size={22} className="text-white drop-shadow" />
              </div>
              <span className="text-[11px] text-white font-medium bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs max-w-full truncate shadow">
                {icon.name}
              </span>
            </div>
          );
        })}

        {/* Windows Rendering */}
        {activeWindows.map((win) => {
          const isMinimized = minimizedWindows.includes(win.id);
          const isActive = activeWindowId === win.id;
          if (isMinimized) return null;

          return (
            <div
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={`absolute top-10 left-2 right-2 bottom-14 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl flex flex-col rounded-t overflow-hidden transition-all duration-150 ${isActive ? 'z-40 ring-2 ring-blue-500/60' : 'z-20 opacity-95'}`}
              style={{ zIndex: win.zIndex + 10 }}
            >
              {/* Window Title Bar */}
              <div className={`px-2.5 py-1.5 flex items-center justify-between text-white font-bold text-xs select-none ${isActive ? 'bg-gradient-to-r from-[#000080] to-[#1084d0]' : 'bg-gray-600'}`}>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate">{win.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                    className="w-5 h-5 bg-[#c0c0c0] text-black border border-t-white border-l-white border-r-black border-b-black text-[10px] flex items-center justify-center font-bold active:border-t-black active:border-l-black"
                  >
                    <Minus size={10} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                    className="w-5 h-5 bg-[#c0c0c0] text-black border border-t-white border-l-white border-r-black border-b-black text-[10px] flex items-center justify-center font-bold active:border-t-black active:border-l-black"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="flex-1 bg-white overflow-y-auto text-black relative flex flex-col text-xs">
                {win.id === 'browser' && <RealBrowserApp />}
                {win.id === 'computer' && <MyComputerApp />}
                {win.id === 'filesystem' && <FileSystemApp fileSystem={fileSystem} setFileSystem={setFileSystem} openApp={openApp} />}
                {win.id === 'minesweeper' && <MinesweeperApp />}
                {win.id === 'solitaire' && <SolitaireApp />}
                {win.id === 'calculator' && <CalculatorApp />}
                {win.id === 'winamp' && <WinampApp />}
                {win.id === 'paint' && <PaintApp />}
                {win.id === 'notepad' && <NotepadApp fileId={win.props?.fileId} fileSystem={fileSystem} setFileSystem={setFileSystem} />}
                {win.id === 'photos' && <PhotosApp />}
                {win.id === 'settings' && <SettingsApp wallpaper={wallpaper} setWallpaper={setWallpaper} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} volume={volume} setVolume={setVolume} />}
                {win.id === 'clippy' && <ClippyApp />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Settings Drawer */}
      {isQuickSettingsOpen && (
        <div className="absolute bottom-12 left-3 right-3 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black p-4 z-50 shadow-2xl rounded text-xs">
          <div className="font-bold border-b border-gray-400 pb-2 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><SettingsIcon size={14}/> Mobile Control Center</span>
            <span className="text-[10px] text-blue-950 cursor-pointer font-bold" onClick={() => setIsQuickSettingsOpen(false)}>Close [X]</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-2 border border-inset border-gray-500">
              <span className="flex items-center gap-2"><Volume2 size={14}/> Volume</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-28 accent-blue-900 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setWifiSignal(!wifiSignal)}
                className={`p-2 border text-left font-semibold flex items-center gap-2 ${wifiSignal ? 'bg-blue-100 border-blue-900 text-blue-950' : 'bg-gray-200 border-gray-500 text-gray-600'}`}
              >
                <Wifi size={14}/> WiFi {wifiSignal ? 'Connected' : 'Off'}
              </button>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 border text-left font-semibold flex items-center gap-2 ${soundEnabled ? 'bg-blue-100 border-blue-900 text-blue-950' : 'bg-gray-200 border-gray-500 text-gray-600'}`}
              >
                <Sparkles size={14}/> Sound {soundEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Menu */}
      {isStartOpen && (
        <div className="absolute bottom-12 left-0 w-64 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black z-50 shadow-2xl flex">
          <div className="bg-[#000080] w-7 flex flex-col items-center justify-end py-3 text-white font-black tracking-widest text-xs [writing-mode:vertical-rl] rotate-180">
            <span>Windows<span className="text-red-400">98</span> Mobile</span>
          </div>
          <div className="flex-1 py-1 flex flex-col text-xs max-h-72 overflow-y-auto">
            {desktopIcons.map(icon => {
              const IconComp = icon.icon;
              return (
                <div 
                  key={icon.id}
                  onClick={() => openApp(icon.app, icon.name)} 
                  className="px-3 py-2 flex items-center gap-3 hover:bg-[#000080] hover:text-white cursor-pointer font-medium"
                >
                  <IconComp size={16} />
                  <span>{icon.name}</span>
                </div>
              );
            })}
            <div className="border-t border-gray-400 my-1"></div>
            <div 
              onClick={() => { setBooting(true); setBootStep(0); setIsStartOpen(false); }} 
              className="px-3 py-2 flex items-center gap-3 hover:bg-red-900 hover:text-white cursor-pointer font-medium text-red-700 hover:text-white"
            >
              <SmartphoneNfc size={16} />
              <span>Restart Phone...</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1.5 justify-between z-45 shadow-inner">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { playSound('click'); setIsStartOpen(!isStartOpen); setIsQuickSettingsOpen(false); }}
            className={`px-2.5 py-1 bg-[#c0c0c0] border-2 font-bold text-xs flex items-center gap-1 shadow-sm active:border-t-black active:border-l-black ${isStartOpen ? 'border-t-black border-l-black border-r-white border-b-white bg-gray-300' : 'border-t-white border-l-white border-r-black border-b-black'}`}
          >
            <span className="text-sm">🪟</span>
            <span>Start</span>
          </button>

          <div className="h-6 w-0.5 bg-gray-400 mx-1"></div>

          {/* Running Apps Pills */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[170px]">
            {activeWindows.map(win => {
              const isMinimized = minimizedWindows.includes(win.id);
              const isActive = activeWindowId === win.id && !isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => focusWindow(win.id)}
                  className={`px-2 py-1 text-[11px] truncate max-w-[85px] border-2 font-medium flex items-center gap-1 ${isActive ? 'border-t-black border-l-black border-r-white border-b-white bg-gray-300 shadow-inner' : 'border-t-white border-l-white border-r-black border-b-black bg-[#c0c0c0]'}`}
                >
                  <span className="truncate">{win.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="border border-inset border-gray-500 bg-[#dfdfdf] px-2 py-0.5 text-[10px] font-mono shadow-inner">
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  );
}

function RealBrowserApp() {
  const [query, setQuery] = useState('');
  const [activeUrl, setActiveUrl] = useState('https://www.google.com/webhp?igu=1');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [isGoogleMode, setIsGoogleMode] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    if (isGoogleMode && query.trim()) {
      setActiveUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`);
    } else {
      let target = inputUrl;
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      setActiveUrl(target);
      setIsGoogleMode(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0]">
      <div className="bg-[#c0c0c0] p-1.5 border-b border-gray-400 space-y-1">
        <div className="flex items-center gap-1 text-[11px]">
          <span className="font-bold text-blue-900">Address:</span>
          <form onSubmit={handleSearch} className="flex-1 flex gap-1">
            <input 
              type="text" 
              value={inputUrl} 
              onChange={(e) => { setInputUrl(e.target.value); setIsGoogleMode(false); }}
              className="w-full bg-white border border-inset border-gray-600 px-1 py-0.5 font-mono text-[11px]"
              placeholder="Enter URL or search..."
            />
            <button type="submit" className="px-2 bg-gray-200 border border-t-white border-l-white border-r-black border-b-black font-bold">Go</button>
          </form>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 border border-inset border-gray-400">
          <span className="text-[10px] font-bold text-red-600">Google 98:</span>
          <input 
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsGoogleMode(true); }}
            placeholder="Search Google web..."
            className="flex-1 text-[11px] outline-none px-1"
          />
          <button 
            onClick={() => {
              if (query.trim()) {
                setActiveUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`);
              }
            }}
            className="px-2 py-0.5 bg-blue-700 text-white font-bold text-[10px] rounded"
          >
            Search
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white relative flex flex-col">
        <iframe 
          src={activeUrl} 
          title="Internet Explorer Browser Viewport" 
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

function FileSystemApp({ fileSystem, setFileSystem, openApp }) {
  const [newFileName, setNewFileName] = useState('');

  const createFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const newFile = {
      id: Date.now().toString(),
      name: newFileName.endsWith('.txt') ? newFileName : newFileName + '.txt',
      content: '',
      type: 'txt'
    };
    setFileSystem([...fileSystem, newFile]);
    setNewFileName('');
  };

  const deleteFile = (id) => {
    setFileSystem(fileSystem.filter(f => f.id !== id));
  };

  return (
    <div className="p-3 bg-white h-full space-y-3 font-sans flex flex-col">
      <div className="border-b pb-2 font-bold text-blue-900 flex items-center justify-between">
        <span className="flex items-center gap-1.5"><Folder size={16}/> Browser Cache File System (C:)</span>
        <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-300">localStorage synced</span>
      </div>

      <form onSubmit={createFile} className="flex gap-1">
        <input 
          type="text" 
          placeholder="New filename (e.g. notes.txt)" 
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          className="flex-1 border border-gray-400 px-2 py-1 text-xs"
        />
        <button type="submit" className="px-3 bg-gray-200 border border-t-white border-l-white border-r-black border-b-black text-xs font-bold flex items-center gap-1">
          <Plus size={12}/> Create
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-1.5 border border-inset border-gray-400 p-2 bg-[#fdfdfd]">
        {fileSystem.length === 0 ? (
          <div className="text-gray-500 text-center py-6 text-xs">No cached files found. Create one above!</div>
        ) : (
          fileSystem.map(file => (
            <div key={file.id} className="flex items-center justify-between p-2 border border-gray-200 bg-white hover:bg-blue-50 rounded">
              <div 
                onClick={() => openApp('notepad', file.name, { fileId: file.id })}
                className="flex items-center gap-2 cursor-pointer flex-1 truncate"
              >
                <FileText size={16} className="text-blue-800" />
                <div>
                  <div className="font-bold text-xs truncate">{file.name}</div>
                  <div className="text-[10px] text-gray-500">{file.content.length} characters cached</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => openApp('notepad', file.name, { fileId: file.id })}
                  className="px-2 py-1 bg-gray-100 border text-[10px] font-bold"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteFile(file.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MyComputerApp() {
  const drives = [
    { name: '3½ Floppy (A:)', type: 'Floppy Disk', icon: '💾' },
    { name: '(C:) FlashDisk Cache', type: 'Local Disk (LocalStorage)', icon: '💻' },
    { name: '(D:) CD-ROM', type: 'CD Drive', icon: '💿' },
    { name: 'Control Panel', type: 'System Folder', icon: '⚙️' }
  ];

  return (
    <div className="p-3 bg-white h-full space-y-3 font-sans">
      <div className="border-b pb-2 font-bold text-blue-900 flex items-center gap-2">
        <HardDrive size={16}/> My Computer Storage Drives
      </div>
      <div className="grid grid-cols-2 gap-3">
        {drives.map((d, i) => (
          <div key={i} className="flex flex-col items-center p-2 border border-dashed border-gray-400 rounded hover:bg-blue-50 cursor-pointer">
            <span className="text-3xl mb-1">{d.icon}</span>
            <span className="font-bold text-xs">{d.name}</span>
            <span className="text-[10px] text-gray-500">{d.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MinesweeperApp() {
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const rows = 8;
  const cols = 8;
  const mines = 10;

  const initGame = () => {
    let newGrid = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 }))
    );

    let placed = 0;
    while (placed < mines) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      if (!newGrid[r][c].mine) {
        newGrid[r][c].mine = true;
        placed++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newGrid[r][c].mine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              let nr = r + dr;
              let nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].mine) {
                count++;
              }
            }
          }
          newGrid[r][c].count = count;
        }
      }
    }
    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => { initGame(); }, []);

  const revealCell = (r, c) => {
    if (gameOver || won || grid[r][c].revealed) return;
    let newGrid = [...grid.map(row => [...row])];

    if (newGrid[r][c].mine) {
      newGrid.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    const revealRecursive = (rowIdx, colIdx) => {
      if (rowIdx < 0 || rowIdx >= rows || colIdx < 0 || colIdx >= cols) return;
      if (newGrid[rowIdx][colIdx].revealed) return;
      newGrid[rowIdx][colIdx].revealed = true;
      if (newGrid[rowIdx][colIdx].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            revealRecursive(rowIdx + dr, colIdx + dc);
          }
        }
      }
    };

    revealRecursive(r, c);
    setGrid(newGrid);

    let unrevealedSafe = 0;
    newGrid.forEach(row => row.forEach(cell => { if (!cell.mine && !cell.revealed) unrevealedSafe++; }));
    if (unrevealedSafe === 0) setWon(true);
  };

  return (
    <div className="flex flex-col items-center p-3 bg-[#c0c0c0] h-full">
      <div className="bg-[#c0c0c0] border-2 border-t-black border-l-black border-r-white border-b-white p-2 mb-3 flex items-center justify-between w-full max-w-[260px]">
        <div className="bg-black text-red-600 font-mono font-bold px-2 py-0.5 text-base tracking-widest border border-gray-700">{mines}</div>
        <button onClick={initGame} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-white px-3 py-1 font-bold text-sm">
          {gameOver ? '😵' : won ? '😎' : '🙂'}
        </button>
        <div className="bg-black text-red-600 font-mono font-bold px-2 py-0.5 text-base tracking-widest border border-gray-700">{won ? 'WIN' : gameOver ? 'LOSS' : '⏱️'}</div>
      </div>
      <div className="bg-gray-400 p-2 border-2 border-t-black border-l-black border-r-white border-b-white inline-grid grid-cols-8 gap-0.5">
        {grid.map((row, r) => 
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => revealCell(r, c)}
              className={`w-7 h-7 flex items-center justify-center font-bold text-xs select-none ${cell.revealed ? 'bg-[#c0c0c0] border border-gray-500' : 'bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-white'}`}
            >
              {cell.revealed ? (cell.mine ? '💣' : cell.count > 0 ? cell.count : '') : ''}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function SolitaireApp() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#008000] p-4 text-white text-center">
      <div className="text-4xl mb-2">🂡 🂱 🂾</div>
      <div className="font-bold text-sm mb-1">Classic Solitaire 98</div>
      <p className="text-[11px] text-green-200">Klondike deal of 3 cards is ready. Tap cards to send to foundation piles!</p>
      <div className="mt-4 flex gap-2">
        <div className="w-12 h-16 bg-white text-black rounded border border-gray-400 flex items-center justify-center font-bold shadow">A♠</div>
        <div className="w-12 h-16 bg-blue-900 text-white rounded border border-blue-400 flex items-center justify-center font-bold shadow">🂠</div>
      </div>
    </div>
  );
}

function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleBtn = (val) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === '=') {
      try {
        const fullExpr = equation + display;
        const safeCalculate = (fnExpr) => {
          const sanitized = fnExpr.replace(/[^0-9+\-*/().]/g, '');
          return Function(`'use strict'; return (${sanitized})`)();
        };
        const res = safeCalculate(fullExpr);
        setDisplay(String(res));
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setEquation(equation + display + ' ' + val + ' ');
      setDisplay('0');
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  return (
    <div className="bg-[#c0c0c0] p-3 h-full flex flex-col justify-center items-center">
      <div className="w-64 bg-white border-2 border-t-black border-l-black border-r-white border-b-white p-2 mb-2 text-right font-mono text-xl tracking-wider shadow-inner">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5 w-64">
        {['7','8','9','/', '4','5','6','*', '1','2','3','-', '0','C','=','+'].map(btn => (
          <button 
            key={btn}
            onClick={() => handleBtn(btn)}
            className="p-3 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black font-bold active:border-t-black active:border-l-black"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

function WinampApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const playlist = [
    { title: '1. Darude - Sandstorm (Win98 Remix)', length: '3:45' },
    { title: '2. Windows 98 Startup Ambient Loop', length: '2:10' },
    { title: '3. Dial-up Modem Connection Symphony', length: '1:55' }
  ];

  return (
    <div className="bg-black text-green-400 font-mono p-3 h-full flex flex-col justify-between text-xs">
      <div className="bg-gray-900 border border-green-800 p-2 rounded flex items-center justify-between">
        <span className="font-bold text-white">WINAMP v2.5 Llama</span>
        <span className="text-[10px] text-gray-400">128kbps</span>
      </div>
      <div className="bg-gray-950 border border-green-900 p-3 rounded my-2 space-y-2">
        <div className="text-cyan-400 font-bold truncate">{playlist[trackIndex].title}</div>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>{isPlaying ? '▶ PLAYING' : '⏸ PAUSED'}</span>
          <span>{playlist[trackIndex].length}</span>
        </div>
        <div className="flex items-end gap-1 h-10 pt-1 justify-center">
          {[40, 70, 30, 90, 60, 85, 45, 95].map((h, i) => (
            <div key={i} className="w-2 bg-green-500" style={{ height: isPlaying ? `${Math.floor(Math.random() * 80) + 15}%` : `${h}%` }}></div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="border border-green-800 p-1 bg-gray-900 max-h-20 overflow-y-auto">
          {playlist.map((track, idx) => (
            <div key={idx} onClick={() => { setTrackIndex(idx); setIsPlaying(true); }} className={`px-1 cursor-pointer truncate ${trackIndex === idx ? 'bg-green-900 text-white font-bold' : 'text-gray-300'}`}>
              {track.title}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-1 bg-[#c0c0c0] text-black font-bold border-2 border-t-white border-l-white border-r-black border-b-black">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaintApp() {
  const [color, setColor] = useState('#000000');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => { setIsDrawing(false); const canvas = canvasRef.current; if (canvas) canvas.getContext('2d').beginPath(); };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const colors = ['#000000', '#808080', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] p-1">
      <div className="flex-1 bg-white border-2 border-t-black border-l-black border-r-white border-b-white overflow-hidden relative">
        <canvas ref={canvasRef} width={280} height={300} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} className="bg-white w-full h-full cursor-crosshair" />
      </div>
      <div className="grid grid-cols-8 gap-1 mt-2 p-1 bg-gray-300 border border-gray-400">
        {colors.map(c => (
          <button key={c} onClick={() => setColor(c)} className="w-6 h-6 border" style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
}

function NotepadApp({ fileId, fileSystem, setFileSystem }) {
  const file = fileSystem.find(f => f.id === fileId) || fileSystem[0];
  const [text, setText] = useState(file ? file.content : '');
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = () => {
    if (!file) return;
    const updated = fileSystem.map(f => f.id === file.id ? { ...f, content: text } : f);
    setFileSystem(updated);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-[#c0c0c0] px-2 py-1 border-b border-gray-400 flex items-center justify-between text-xs">
        <span className="font-bold text-blue-900">Editing: {file ? file.name : 'Untitled.txt'}</span>
        <button 
          onClick={handleSave} 
          className="px-2.5 py-0.5 bg-gray-200 border-2 border-t-white border-l-white border-r-black border-b-black font-bold flex items-center gap-1 active:border-t-black active:border-l-black"
        >
          <Save size={12}/> {savedStatus ? 'Saved!' : 'Save Cache'}
        </button>
      </div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        className="flex-1 w-full bg-white p-2 font-mono text-xs resize-none outline-none border-0" 
      />
    </div>
  );
}

function PhotosApp() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#c0c0c0] h-full">
      <div className="bg-white p-2 border-2 border-t-black border-l-black border-r-white border-b-white shadow mb-3">
        <div className="w-56 h-36 bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
          🖼️ Bliss 1998 (Sample)
        </div>
      </div>
      <span className="text-xs text-gray-700">Bliss_hillside_draft.bmp (640x480)</span>
    </div>
  );
}

function SettingsApp({ wallpaper, setWallpaper, soundEnabled, setSoundEnabled, volume, setVolume }) {
  const wallpapers = [
    { name: 'Classic Teal', color: '#008080' },
    { name: 'Midnight Blue', color: '#000080' },
    { name: 'Win98 Slate', color: '#4a5568' },
    { name: 'Bliss Green', color: '#276749' }
  ];

  return (
    <div className="p-3 bg-white h-full space-y-4 font-sans text-xs">
      <div className="font-bold text-blue-900 border-b pb-1 flex items-center gap-2">
        <SettingsIcon size={14}/> Mobile Display & Audio Preferences
      </div>

      <div className="space-y-2">
        <label className="font-semibold block text-gray-700">Desktop Wallpaper Theme:</label>
        <div className="grid grid-cols-2 gap-2">
          {wallpapers.map(wp => (
            <button 
              key={wp.color}
              onClick={() => setWallpaper(wp.color)}
              className={`p-2 border text-left font-bold flex items-center gap-2 ${wallpaper === wp.color ? 'border-blue-900 bg-blue-50' : 'border-gray-400'}`}
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: wp.color }}></div>
              <span>{wp.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <label className="font-semibold block text-gray-700">Audio Chords:</label>
        <div className="flex items-center justify-between p-2 bg-gray-100 border">
          <span>Enable Startup & Click Sound Effects</span>
          <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function ClippyApp() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#ffffe1] p-4 text-black text-center">
      <div className="text-5xl mb-3 animate-bounce">📎</div>
      <div className="bg-white border border-gray-600 p-3 rounded-lg shadow-lg relative mb-4 text-xs">
        <p className="font-medium">It looks like you are using the new Cache File System and Google Search in Internet Explorer! Need any assistance?</p>
      </div>
    </div>
  );
}