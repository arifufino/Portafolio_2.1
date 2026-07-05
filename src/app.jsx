import { useState, useRef, useEffect } from "react";
import Wave from "react-wavify";
import emailjs from "@emailjs/browser";
import "./style.css";

// ============================================
// 🔊 SONIDOS — colócalos en: src/assets/sounds/
// ============================================
import hoverSwitchSound from "./assets/sounds/hoverSwitch.mp3";
import clickSound from "./assets/sounds/clickButton.mp3"; // sonido al PRESIONAR botones
import closeWindowSound from "./assets/sounds/closeWindow.mp3"; // 🆕 sonido al CERRAR una ventana
import backgroundMusic from "./assets/sounds/backgroundMusic.mp3"; // música de fondo en loop

// ============================================
// 🖼️ IMÁGENES — colócalas en: src/assets/images/
// ============================================
import logo from "./assets/images/logo.jpeg";
import sobreMiFoto from "./assets/images/sobreMi.jpeg"; // tu foto para "Sobre mí"

// 🖼️ Imágenes de proyectos — colócalas en: src/assets/images/proyectos/
import proyectoUno from "./assets/images/proyectos/proyectoUno.png";
import proyectoDos from "./assets/images/proyectos/proyectoDos.png";
import proyectoTres from "./assets/images/proyectos/proyectoTres.png";

// ============================================
// 📧 EMAILJS — configurado vía variables de entorno (.env)
// ============================================
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

emailjs.init(EMAILJS_PUBLIC_KEY);
// ============================================
// ✏️ CONTENIDO EDITABLE — personaliza estos datos
// ============================================
const PROYECTOS = [
  {
    titulo: "Proyecto Uno",
    descripcion:
      "Un teclado virtual circular para Windows diseñado para ofrecer una experiencia visual moderna, intuitiva y altamente accesible. \nIdeal para pantallas táctiles, configuraciones personalizadas y usuarios que buscan una alternativa innovadora al teclado tradicional.",
    imagen: proyectoUno,
    link: "https://github.com/arifufino/Teclado-Virtual-Circular",
  },
  {
    titulo: "Proyecto Dos",
    descripcion:
      "Proyecto_Final_Spring_Boot es un sistema de gestión de productos con backend REST API desarrollado en Spring Boot 3 y base de datos H2. Incluye operaciones CRUD completas, validaciones y documentación Swagger. El frontend está implementado en Java Swing para consumir la API.",
    imagen: proyectoDos,
    link: "https://github.com/arifufino/Crud_Papeleria",
  }
  /*{
    titulo: "Proyecto Tres",
    descripcion: "Descripción corta de tu proyecto.",
    imagen: proyectoTres,
    link: "#",
  },*/
];

const LINKS = [
  { nombre: "GitHub", url: "https://github.com/arifufino" },
  { nombre: "LinkedIn", url: "https://www.linkedin.com/in/ariel-paz-031302252/?locale=en" },
  { nombre: "Instagram", url: "https://www.instagram.com/garifufino/" },
  { nombre: "Spotify", url: "https://open.spotify.com/user/12173124263" },
];

// Configuración de cada ventana: título mostrado y ancho
const WINDOW_CONFIG = {
  proyectos: { title: "Proyectos.exe", width: 560 },
  "sobre-mi": { title: "SobreMi.doc", width: 560 },
  correo: { title: "Correo.exe", width: 420 },
  links: { title: "Links.lnk", width: 360 },
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [windows, setWindows] = useState([]); // { id, type, x, y, z, minimized }
  const [mailStatus, setMailStatus] = useState("idle");// idle | sending | success | error
  
  const mailFormRef = useRef(null);
  const zCounter = useRef(10);
  const dragState = useRef(null); // { id, offsetX, offsetY }

  // --- Audio ---
  const switchHoverAudio = useRef(new Audio(hoverSwitchSound));
  const clickAudio = useRef(new Audio(clickSound));
  const closeAudio = useRef(new Audio(closeWindowSound)); // 🆕
  const bgMusicRef = useRef(null); // referencia al <audio> del JSX

  const playSwitchHover = () => {
    switchHoverAudio.current.currentTime = 0;
    switchHoverAudio.current.play().catch(() => {});
  };

  const playClick = () => {
    clickAudio.current.currentTime = 0;
    clickAudio.current.play().catch(() => {});
  };

  const playCloseSound = () => {
    // 🆕
    closeAudio.current.currentTime = 0;
    closeAudio.current.play().catch(() => {});
  };

  // --- Tema claro/oscuro ---
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // --- Música de fondo ---
  useEffect(() => {
    if (!bgMusicRef.current) return;
    if (musicPlaying) {
      bgMusicRef.current.play().catch(() => {});
    } else {
      bgMusicRef.current.pause();
    }
  }, [musicPlaying]);

  const toggleMusic = () => {
    playClick();
    setMusicPlaying((prev) => !prev);
  };

  // --- Manejo de ventanas ---
  const openWindow = (type) => {
    playClick();
    if (type === "correo") setMailStatus("idle");
    setWindows((prev) => {
      const existente = prev.find((w) => w.type === type);
      zCounter.current += 1;
      if (existente) {
        return prev.map((w) =>
          w.id === existente.id
            ? { ...w, z: zCounter.current, minimized: false }
            : w
        );
      }
      const offset = prev.length * 28;
      return [
        ...prev,
        {
          id: `${type}-${Date.now()}`,
          type,
          x: 140 + offset,
          y: 90 + offset,
          z: zCounter.current,
          minimized: false,
        },
      ];
    });
  };

  const closeWindow = (id) => {
    playCloseSound(); // 🆕 antes era playClick()
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const minimizeWindow = (id) => {
    playClick();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  };

  const restoreWindow = (id) => {
    playClick();
    zCounter.current += 1;
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, minimized: false, z: zCounter.current } : w
      )
    );
  };

  const bringToFront = (id) => {
    zCounter.current += 1;
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, z: zCounter.current } : w))
    );
  };

  const startDrag = (e, win) => {
    dragState.current = {
      id: win.id,
      offsetX: e.clientX - win.x,
      offsetY: e.clientY - win.y,
    };
    bringToFront(win.id);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.current) return;
      const { id, offsetX, offsetY } = dragState.current;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id
            ? { ...w, x: e.clientX - offsetX, y: e.clientY - offsetY }
            : w
        )
      );
    };
    const handleMouseUp = () => {
      dragState.current = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Ventanas visibles (no minimizadas) y cuál está activa (para resaltarla en la barra)
  const visibleWindows = windows.filter((w) => !w.minimized);
  const activeId = visibleWindows.length
    ? visibleWindows.reduce((a, b) => (b.z > a.z ? b : a)).id
    : null;

  // --- Contenido de cada ventana ---
  const renderWindowContent = (type) => {
    switch (type) {
      case "proyectos":
        return (
          <div className="proyectos-grid">
            {PROYECTOS.map((p) => (
              <a
                key={p.titulo}
                href={p.link}
                className="proyecto-card"
                target="_blank"
                rel="noreferrer"
              >
                <img src={p.imagen} alt={p.titulo} />
                <h3>{p.titulo}</h3>
                <p>{p.descripcion}</p>
              </a>
            ))}
          </div>
        );

      case "sobre-mi":
        return (
          <div className="sobre-mi-content">
            <img src={sobreMiFoto} alt="Foto de perfil" className="sobre-mi-foto" />
            <div className="sobre-mi-text">
              <p>
                Me llamo Ariel Paz y estudio la carrera de Desarrollo
                de Software en la Escuela Politécnica Nacional (EPN).
                Realicé mis estudios de inglés en el CEC, donde completé
                hasta el nivel Académico 4, aprobé el examen de nivel B1
                y obtuve varios certificados que respaldan mi formación.
              </p>
              <p>
                Desde siempre me ha gustado crear cosas y dar vida a nuevas
                ideas. Me apasiona escuchar música y perderme en mi propio
                mundo, porque es ahí donde encuentro inspiración y motivación.
                Creo firmemente que solo vivimos una vez y no pienso
                desperdiciar mi vida sin antes demostrar la mejor versión de mí mismo.
              </p>
              <p className="sobre-mi-quote">
                "La madurez no llega con la edad; llega con las experiencias que
                vivimos y con las ganas que tengamos para aprender de ellas."
                <span>— Ariel Paz</span>
              </p>
            </div>
          </div>
        );

      case "correo":
        return (
          <form
            ref={mailFormRef}
            className="mail-form"
            onSubmit={(e) => {
              e.preventDefault();
              setMailStatus("sending");
              emailjs
                .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, mailFormRef.current)
                .then(() => {
                  playClick();
                  setMailStatus("success");
                  mailFormRef.current.reset();
                })
                .catch((error) => {
                  console.error("Error al enviar el correo:", error);
                  setMailStatus("error");
                });
            }}
          >
            <label>
              Tu correo
              <input type="email" name="correo" required placeholder="tu@correo.com" />
            </label>
            <label>
              Asunto
              <input type="text" name="asunto" required placeholder="Asunto del mensaje" />
            </label>
            <label>
              Descripción
              <textarea name="descripcion" rows={4} required placeholder="Escribe tu mensaje..." />
            </label>

            <button
              type="submit"
              className="mail-send-btn"
              disabled={mailStatus === "sending"}
            >
              {mailStatus === "sending" ? "Enviando..." : "Enviar"}
            </button>

            {mailStatus === "success" && (
              <p className="mail-status success">
                ✅ ¡Mensaje enviado con éxito! Te responderé pronto.
              </p>
            )}
            {mailStatus === "error" && (
              <p className="mail-status error">
                ❌ Hubo un error al enviar. Intentá de nuevo o escribime directo a arifufinox@hotmail.com.
              </p>
            )}
          </form>
        );

      case "links":
        return (
          <ul className="links-list">
            {LINKS.map((l) => (
              <li key={l.nombre}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.nombre}
                </a>
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  const buttons = [
    { label: "Proyectos", type: "proyectos" },
    { label: "Sobre mí", type: "sobre-mi" },
    { label: "Enviar Correo", type: "correo" },
    { label: "Links", type: "links" },
  ];

  return (
    <div className="desk">
      <Wave
        fill="rgba(0, 102, 255, 0.25)"
        paused={false}
        options={{
          height: 20,
          amplitude: 40,
          speed: 0.15,
          points: 3,
        }}
        className="background-wave"
      />
      <Wave
        fill="rgba(0, 102, 255, 0.25)"
        options={{
          height: 30,
          amplitude: 30,
          speed: 0.20,
          points: 4,
        }}
        className="background-wave front"
      />
      {/* 🎵 Música de fondo — colócala en src/assets/sounds/backgroundMusic.mp3 */}
      <audio ref={bgMusicRef} src={backgroundMusic} loop />

      {/* Interruptor modo claro/oscuro — esquina superior izquierda */}
      <button
        className="theme-switch"
        onMouseEnter={playSwitchHover}
        onClick={() => {
          playClick();
          setDarkMode((prev) => !prev);
        }}
        aria-label="Cambiar entre modo claro y oscuro"
        aria-pressed={darkMode}
      >
        <span className="switch-knob" />
      </button>

      {/* Botón de música — esquina inferior izquierda */}
      <button
        className={`music-toggle ${musicPlaying ? "playing" : ""}`}
        onClick={toggleMusic}
        aria-label="Prender o apagar la música de fondo"
        aria-pressed={musicPlaying}
      >
        <span className="eq-bar" />
        <span className="eq-bar" />
        <span className="eq-bar" />
      </button>

      <main className="stage">
        {/* 🖼️ Logo / etiqueta central */}
        <img src={logo} alt="Logo personal" className="record-label" />

        <div className="dial-line" aria-hidden="true" />

        <nav className="control-panel">
          {buttons.map(({ label, type }) => (
            <button
              key={type}
              className="panel-button"
              onClick={() => openWindow(type)}
            >
              <span className="panel-needle" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      </main>

      {/* Ventanas abiertas (tipo escritorio) */}
      {visibleWindows.map((win) => {
        const config = WINDOW_CONFIG[win.type];
        return (
          <div
            key={win.id}
            className="os-window"
            style={{ left: win.x, top: win.y, zIndex: win.z, width: config.width }}
            onMouseDown={() => bringToFront(win.id)}
            role="dialog"
            aria-label={config.title}
          >
            <div className="os-window-titlebar" onMouseDown={(e) => startDrag(e, win)}>
              <span className="os-window-title">{config.title}</span>
              <div className="os-window-controls">
                <button
                  className="os-window-minimize"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(win.id);
                  }}
                  aria-label="Minimizar ventana"
                >
                  –
                </button>
                <button
                  className="os-window-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  aria-label="Cerrar ventana"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="os-window-body">{renderWindowContent(win.type)}</div>
          </div>
        );
      })}

      {/* Barra de tareas — solo aparece si hay al menos una ventana abierta */}
      {windows.length > 0 && (
        <div className="taskbar" role="tablist" aria-label="Ventanas abiertas">
          {windows.map((w) => {
            const config = WINDOW_CONFIG[w.type];
            const isActive = w.id === activeId && !w.minimized;
            return (
              <button
                key={w.id}
                className={`taskbar-item ${isActive ? "active" : ""} ${
                  w.minimized ? "minimized" : ""
                }`}
                onClick={() => restoreWindow(w.id)}
                role="tab"
                aria-selected={isActive}
              >
                {config.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { App };