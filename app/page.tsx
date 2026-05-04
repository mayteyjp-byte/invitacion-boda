"use client";

import { useEffect, useState, useRef } from "react";



export default function Home() {
  const weddingDate = new Date("2026-06-05T18:00:00");

  const [opened, setOpened] = useState(false);
  const [envelopeAnimating, setEnvelopeAnimating] = useState(false);
  const [guestName, setGuestName] = useState("Invitado especial");
  const [passes, setPasses] = useState("2");
  const [guestId, setGuestId] = useState("000");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const [wishSent, setWishSent] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    // ── Parámetros URL ──
    const params = new URLSearchParams(window.location.search);
    setGuestName(params.get("invitado") || "Invitado especial");
    setPasses(params.get("pases") || "2");
    setGuestId(params.get("id") || "000");



    // ── Contador ──
    const timer = setInterval(() => {
      const distance = weddingDate.getTime() - Date.now();
      setTimeLeft({
        dias: Math.max(0, Math.floor(distance / 86400000)),
        horas: Math.max(0, Math.floor((distance / 3600000) % 24)),
        minutos: Math.max(0, Math.floor((distance / 60000) % 60)),
        segundos: Math.max(0, Math.floor((distance / 1000) % 60)),
      });
    }, 1000);

    // ── Scroll animations ──
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    setTimeout(() => {
      document.querySelectorAll(".fadeIn").forEach((el) => observer.observe(el));
    }, 100);

    return () => { clearInterval(timer); observer.disconnect(); };
  }, [opened]);

  // ── Abrir invitación + autoplay ──
  const openInvitation = () => {
    setEnvelopeAnimating(true);

    // Autoplay inmediato al presionar el botón de abrir invitación
    if (audioRef.current) {
      audioRef.current.volume = 0.32;
      audioRef.current.play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    }

    setTimeout(() => {
      setOpened(true);
      setTimeout(() => {
        document.querySelectorAll(".fadeIn").forEach((el) => {
          const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
            { threshold: 0.1 }
          );
          obs.observe(el);
        });
      }, 300);
    }, 900);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) { audioRef.current.pause(); setMusicPlaying(false); }
    else { audioRef.current.play().catch(() => { }); setMusicPlaying(true); }
  };

  const restartMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => { });
    setMusicPlaying(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const buildFormLink = (confirmacion: string, mensaje: string) => {
    return `https://docs.google.com/forms/d/e/1FAIpQLScD4yrdd8uT1F7iMzA9yERterSHbEAPPDQfhhdgAYf-Q4U0sw/viewform?usp=pp_url&entry.856620481=${encodeURIComponent(guestName)}&entry.234824417=${encodeURIComponent(guestId)}&entry.677535393=${encodeURIComponent(confirmacion)}&entry.234447408=${encodeURIComponent(mensaje)}`;
  };

  const handleRSVP = async (attending: boolean) => {
    setRsvpLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setRsvpSent(true);
    setRsvpLoading(false);

    const mensaje = attending
      ? `Confirmo mi asistencia. Pase válido para ${passes} persona(s).`
      : "Lamentablemente no podré asistir, pero les envío mis mejores deseos.";

    const formLink = buildFormLink(attending ? "SÍ" : "NO", mensaje);
    setTimeout(() => window.open(formLink, "_blank"), 500);
  };

  const handleWishSubmit = async () => {
    if (!wishMessage.trim()) return;
    await new Promise((r) => setTimeout(r, 700));
    setWishSent(true);
    const formLink = buildFormLink("SÍ", wishMessage);
    window.open(formLink, "_blank");
  };

  const driveLink = "https://drive.google.com/drive/folders/11CSEpYMrCxdc_Hz3tCsbuz84t3TBwr7Y?usp=drive_link";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(driveLink)}`;

  return (
    <main>


      {/* ── AUDIO ── */}
      <audio ref={audioRef} loop>
        <source src="/cancion.mp3" type="audio/mpeg" />
      </audio>

      {/* ── CONTROLES DE MÚSICA ── */}
      {opened && (
        <div className="musicControls">
          <button className="musicBtn" onClick={toggleMusic} title={musicPlaying ? "Pausar" : "Reproducir"}>
            {musicPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button className="musicBtn musicReplay" onClick={restartMusic} title="Reiniciar canción">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
          {musicPlaying && (
            <div className="musicBars">
              <span /><span /><span /><span />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          SOBRE
      ══════════════════════════════════════ */}
      {!opened && (
        <section className={`envelopeCover ${envelopeAnimating ? "animating" : ""}`}>
          {[...Array(12)].map((_, i) => <div key={i} className={`petal petal-${i}`} />)}

          <div className={`envelope ${envelopeAnimating ? "openEnvelope" : ""}`}>
            <div className="flapTop" />
            <div className="flapBottom" />
            <div className="envelopeBody">
              <div className="seal">
                <span>{"M"}</span>
                <span className="sealAmp">{"&"}</span>
                <span>{"JP"}</span>
              </div>
              <div className="coverText">
                <p className="coverLabel">Con todo nuestro amor</p>
                <h1>Mayte {"&"} Juan Pablo</h1>
                <div className="coverDivider">
                  <span />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#9A7090">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span />
                </div>
                <p>Dios nos concede la dicha de unir nuestras vidas y queremos compartir este momento tan especial contigo.</p>
                <button className="btn" onClick={openInvitation}>
                  Abrir invitación
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 8 }}>
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="hero">
        <div className="heroOverlay" />
        <div className="heroContent fadeIn">
          <p className="heroLabel">Nuestra boda</p>

          <h1 className="names">
            Mayte
            <span className="amp">{"&"}</span>
            Juan Pablo
          </h1>

          {/* ── FECHA DESTACADA – Opción A ── */}
          <div className="heroDate">
            <div className="heroDatePill">
              <span className="heroDateFrag">
                <strong>05</strong>
                <small>día</small>
              </span>
              <span className="heroDateSep">·</span>
              <span className="heroDateFrag heroDateCenter">
                <strong>Junio</strong>
                <small>mes</small>
              </span>
              <span className="heroDateSep">·</span>
              <span className="heroDateFrag">
                <strong>2026</strong>
                <small>año</small>
              </span>
            </div>
            <p className="heroDateSub">Viernes · 6:00 p.m.</p>
          </div>

          <div className="heroDivider">
            <span />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#E7B1A7">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span />
          </div>

          <p className="heroPhrase">
            Dios nos permitió encontrarnos, caminar juntos y hoy nos concede la dicha de prometer nuestro amor para toda la vida.
          </p>
          <a className="btn heroBtn" href="#detalles">Ver invitación</a>
        </div>
        <div className="heroScroll">
          <div className="scrollLine" />
          <span>Desliza</span>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INVITADO
      ══════════════════════════════════════ */}
      <section className="section guest fadeIn">
        <div className="ornament">✦</div>
        <p className="mini">Con mucho cariño para</p>
        <h2>{guestName}</h2>
        <div className="passChip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          Pase válido para <strong>{passes}</strong> persona(s)
        </div>
        <p className="guestNote">
          Esta invitación ha sido preparada especialmente para ti. Gracias por formar parte de nuestra historia.
        </p>
      </section>

      {/* ══════════════════════════════════════
          INTRO
      ══════════════════════════════════════ */}
      <section className="section intro">
        <div className="textBlock fadeIn">
          <p>Creemos que el amor verdadero es una bendición de Dios, un regalo que se cuida con paciencia, respeto, fe y compromiso.</p>
        </div>
        <div className="textBlock fadeIn">
          <p>Hoy, con el corazón lleno de gratitud, queremos unir nuestras vidas ante Dios y ante las personas que han sido parte importante de nuestro camino.</p>
        </div>
        <div className="textBlock highlight fadeIn">
          <p>Esta promesa la queremos hacer en tu presencia…</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COUNTDOWN
      ══════════════════════════════════════ */}
      <section className="section countdown fadeIn">
        <p className="mini" style={{ color: "#E7B1A7" }}>Cuenta regresiva</p>
        <h2>Faltan</h2>
        <div className="timer">
          {[
            { val: timeLeft.dias, label: "Días" },
            { val: timeLeft.horas, label: "Horas" },
            { val: timeLeft.minutos, label: "Min" },
            { val: timeLeft.segundos, label: "Seg" },
          ].map(({ val, label }) => (
            <div key={label} className="timerCell">
              <strong>{String(val).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          GALERÍA
      ══════════════════════════════════════ */}
      <section className="section gallerySection fadeIn">
        <p className="mini">Nuestra historia</p>
        <h2>Nuestros momentos</h2>
        <p className="sectionText">Cada recuerdo nos ha acercado a este día. Gracias por acompañarnos en esta nueva etapa.</p>
        <div className="gallery">
          <div className="galleryItem galleryLeft fadeIn">
            <img src="/fotos/Foto 1.jpeg" alt="Momento especial" />
            <div className="galleryOverlay" />
          </div>
          <div className="galleryItem galleryCenter fadeIn">
            <img src="/fotos/Foto 2.png" alt="Bailando juntos" />
            <div className="galleryOverlay" />
            <div className="galleryTag">She said YES!</div>
          </div>
          <div className="galleryItem galleryRight fadeIn">
            <img src="/fotos/Foto 3.png" alt="Momento especial" />
            <div className="galleryOverlay" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DETALLES DEL EVENTO
      ══════════════════════════════════════ */}
      <section id="detalles" className="section details fadeIn">
        <p className="mini">El gran día</p>
        <h2>Detalles del evento</h2>
        <div className="detailsGrid">
          <div className="card fadeIn">
            <div className="cardIcon">⛪</div>
            <p className="cardTop">Ceremonia religiosa</p>
            <h3>Iglesia El Ranchito</h3>
            <p className="hour">6:00 p.m.</p>
            <p>Nos acompañará la bendición de Dios en el inicio de nuestra vida como esposos.</p>
            <a href="https://maps.app.goo.gl/GkN18Dv22YduQg2K9" target="_blank" className="cardLink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              Ver ubicación
            </a>
            <div className="mapEmbed">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.0!2d-99.65!3d19.28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDE2JzQ4LjAiTiA5OcKwMzknMDAuMCJX!5e0!3m2!1ses!2smx!4v1234567890"
                width="100%" height="160" loading="lazy" title="Iglesia El Ranchito" />
            </div>
          </div>
          <div className="card fadeIn">
            <div className="cardIcon">🥂</div>
            <p className="cardTop">Recepción</p>
            <h3>Salón "El Rey"</h3>
            <p className="hour">7:00 p.m. · Ocho Cedros</p>
            <p>Después de la ceremonia, celebraremos juntos este momento tan especial.</p>
            <a href="https://maps.app.goo.gl/ukJrEieA9qoPKG6V9" target="_blank" className="cardLink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              Ver ubicación
            </a>
            <div className="mapEmbed">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.0!2d-99.65!3d19.28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDE2JzQ4LjAiTiA5OcKwMzknMDAuMCJX!5e0!3m2!1ses!2smx!4v1234567890"
                width="100%" height="160" loading="lazy" title="Salón El Rey" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ITINERARIO
      ══════════════════════════════════════ */}
      <section className="section itinerary fadeIn">
        <p className="mini">Programa del día</p>
        <h2>Itinerario</h2>
        <div className="timeline">
          {[
            { time: "6:00 p.m.", event: "Ceremonia religiosa", icon: "⛪", desc: "Iglesia El Ranchito" },
            { time: "7:00 p.m.", event: "Recepción de invitados", icon: "🥂", desc: "Salón El Rey · Ocho Cedros" },
            { time: "8:00 p.m.", event: "Cena y Baile", icon: "🍽️", desc: "Menú especial de celebración" },
          ].map((item, i) => (
            <div key={i} className="timelineItem fadeIn">
              <div className="timelineTime">{item.time}</div>
              <div className="timelineDot"><span>{item.icon}</span></div>
              <div className="timelineContent">
                <strong>{item.event}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CÓDIGO DE VESTIMENTA
          (Ciruela → Gris oscuro, Mauve más oscuro)
      ══════════════════════════════════════ */}
      <section className="section dress fadeIn">
        <p className="mini" style={{ color: "#FAF7F2", opacity: 0.75 }}>Presentación</p>
        <h2>Código de vestimenta</h2>
        <p className="dressType">Formal</p>
        <p className="dressSub">Colores sugeridos para esta noche</p>
        <div className="colorSwatches">


          <div className="swatch">
            <div className="swatchColor" style={{ background: "#676767" }} />
            <span>Gris</span>
          </div>
          <div className="swatch">
            <div className="swatchColor" style={{ background: "#b382a6" }} />
            <span>Rosa</span>
          </div>
          <div className="swatch">
            <div className="swatchColor" style={{ background: "#1C1C1C", border: "2px solid rgba(255,255,255,0.18)" }} />
            <span>Negro</span>
          </div>
          <div className="swatch">
            <div className="swatchColor" style={{ background: "#756352" }} />
            <span>Café</span>
          </div>
        </div>
        <p className="dressNote">Por favor evita el color blanco — es el día de la novia 🤍</p>
      </section>

      {/* ══════════════════════════════════════
          REGALO
      ══════════════════════════════════════ */}
      <section className="section gift fadeIn">
        <p className="mini">Un detalle con amor</p>
        <h2>Regalo</h2>
        <div className="card fadeIn">
          <div className="textBlock innerBlock">
            <p>Con mucha ilusión comenzamos esta nueva etapa formando nuestro hogar.</p>
          </div>
          <div className="textBlock innerBlock">
            <p>Tu presencia será siempre nuestro mayor regalo; sin embargo, si deseas acompañarnos con un detalle, puedes hacerlo a través de la siguiente cuenta.</p>
          </div>
          <div className="bank">
            {[
              { label: "Cuenta Débito", value: "56657713326", key: "cuenta" },
              { label: "CLABE", value: "014427566577133267", key: "clabe" },
              { label: "Beneficiaria", value: "Mayte Alvarez Ceron", key: "nombre" },
              { label: "Institución", value: "Santander", key: "banco" },
            ].map(({ label, value, key }) => (
              <div key={key} className="bankRow">
                <div>
                  <span className="bankLabel">{label}</span>
                  <span className="bankValue">{value}</span>
                </div>
                <button className="copyBtn" onClick={() => copyToClipboard(value, key)}>
                  {copiedField === key ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOTOS
      ══════════════════════════════════════ */}
      <section className="section photos fadeIn">
        <p className="mini">Comparte con nosotros</p>
        <h2>Tus fotos</h2>
        <div className="card fadeIn">
          <p>Queremos vivir este día también a través de tus ojos. Cada sonrisa, cada abrazo y cada momento serán recuerdos que atesoraremos por siempre.</p>
          <img src={qrUrl} className="qr" alt="QR para subir fotos" />
          <a className="btn secondary" href={driveLink} target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /></svg>
            Subir fotos y videos
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RSVP
      ══════════════════════════════════════ */}
      <section className="section rsvp fadeIn">
        <p className="mini">Tu respuesta importa</p>
        <h2>Confirma tu asistencia</h2>
        <p className="rsvpDesc">Tu presencia hará este día aún más especial. Con un solo clic, haznos saber si nos acompañarás.</p>
        {!rsvpSent ? (
          <div className="rsvpCards">
            <button className={`rsvpCard rsvpYes ${rsvpLoading ? "loading" : ""}`} onClick={() => handleRSVP(true)} disabled={rsvpLoading}>
              <span className="rsvpEmoji">🎉</span>
              <strong>¡Ahí estaré!</strong>
              <span>Confirmar asistencia</span>
            </button>
            <button className={`rsvpCard rsvpNo ${rsvpLoading ? "loading" : ""}`} onClick={() => handleRSVP(false)} disabled={rsvpLoading}>
              <span className="rsvpEmoji">💌</span>
              <strong>No podré ir</strong>
              <span>Enviar mensaje de cariño</span>
            </button>
          </div>
        ) : (
          <div className="rsvpConfirmed fadeIn">
            <div className="rsvpHeart">💕</div>
            <h3>¡Gracias, {guestName}!</h3>
            <p>Tu respuesta ha sido enviada. Te redirigiremos a WhatsApp para completar tu confirmación.</p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════
          BUZÓN DE DESEOS
      ══════════════════════════════════════ */}
      <section className="section messages fadeIn">
        <p className="mini">Para nosotros</p>
        <h2>Buzón de deseos</h2>
        <p className="sectionText">Nos encantaría guardar tus palabras como parte de este recuerdo. Déjanos un mensaje que atesoraremos por siempre.</p>
        {!wishSent ? (
          <div className="wishForm fadeIn">
            <div className="wishCard">
              <div className="wishHeader">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#8A6070">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>Escríbenos algo especial</span>
              </div>
              <div className="wishLines">
                {[...Array(4)].map((_, i) => <div key={i} className="wishLine" />)}
              </div>
              <textarea
                className="wishTextarea"
                placeholder="Tu mensaje para Mayte y Juan Pablo..."
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                rows={4}
              />
              <div className="wishFooter">
                <span className="wishFrom">— {guestName}</span>
                <button className="btn wishBtn" onClick={handleWishSubmit} disabled={!wishMessage.trim()}>
                  Enviar deseo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 8 }}>
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wishSentMsg fadeIn">
            <div className="wishSentIcon">💌</div>
            <h3>¡Mensaje enviado!</h3>
            <p>Gracias, {guestName}. Tus palabras serán parte de nuestro recuerdo más precioso.</p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer>
        <div className="footerContent">
          <p className="footerNames">Mayte {"&"} Juan Pablo</p>
          <div className="footerHeart">♥</div>
          <p className="footerDate">05 de junio de 2026</p>
          <p className="footerNote">Hecho con amor para ti</p>
        </div>
      </footer>

      {/* ══════════════════════════════════════
          ESTILOS GLOBALES
      ══════════════════════════════════════ */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Great+Vibes&family=Jost:wght@200;300;400;500&display=swap");

        /* ── PALETA ──
           Ivory        #FAF7F2
           Rose Gold    #E7B1A7
           Champagne    #D1C2A6
           Mauve oscuro #8A6070   ← un tono más oscuro que el anterior #B78FA1
           Ciruela      REMOVIDO
           Gris oscuro  #4A4A4A  ← reemplaza al ciruela en dress code
           Negro        #1C1C1C
        */
        :root {
          --ivory:       #FAF7F2;
          --rose-gold:   #E7B1A7;
          --champagne:   #D1C2A6;
          --ciruela:     #6A2C4A;   /* se mantiene solo para gradientes de fondo */
          --mauve:       #8A6070;   /* tono más oscuro */
          --mauve-light: #B89AAA;   /* ajustado acorde */
          --dark:        #2A1520;
          --text:        #3D1F2E;
          --card-bg:     #FDF9F5;
          --border:      #DEC4D0;
        }

        * { box-sizing: border-box; scroll-behavior: smooth; margin: 0; padding: 0; }
        html, body { width: 100%; overflow-x: hidden; background: var(--ivory); color: var(--text); }
        main { font-family: "Jost", sans-serif; }



        /* ── FADE IN ── */
        .fadeIn { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .fadeIn.visible { opacity: 1; transform: translateY(0); }

        /* ── MUSIC CONTROLS ── */
        .musicControls {
          position: fixed; bottom: 24px; right: 20px; z-index: 998;
          display: flex; align-items: center; gap: 8px;
        }
        .musicBtn {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, var(--ciruela), #4A1A35);
          color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 22px rgba(106,44,74,0.38);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .musicBtn:hover { transform: scale(1.1); box-shadow: 0 12px 30px rgba(106,44,74,0.5); }
        .musicReplay { background: linear-gradient(135deg, var(--mauve), #6A4858); width: 38px; height: 38px; }
        .musicBars {
          display: flex; align-items: flex-end; gap: 3px; height: 22px;
          background: rgba(26,10,20,0.6); padding: 4px 8px;
          border-radius: 999px; backdrop-filter: blur(4px);
        }
        .musicBars span {
          display: block; width: 3px; background: var(--rose-gold); border-radius: 2px;
          animation: bar 0.8s ease-in-out infinite alternate;
        }
        .musicBars span:nth-child(1) { height: 6px;  animation-delay: 0s; }
        .musicBars span:nth-child(2) { height: 14px; animation-delay: 0.15s; }
        .musicBars span:nth-child(3) { height: 10px; animation-delay: 0.3s; }
        .musicBars span:nth-child(4) { height: 16px; animation-delay: 0.45s; }
        @keyframes bar { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }

        /* ── ENVELOPE ── */
        .envelopeCover {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          background: linear-gradient(135deg, #1C0D18 0%, #2A1520 40%, #3D1F35 100%);
          overflow: hidden;
        }
        .envelopeCover.animating { animation: coverFadeOut 0.9s ease forwards; animation-delay: 0.4s; }
        @keyframes coverFadeOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.06); pointer-events: none; }
        }

        .petal {
          position: absolute; border-radius: 50% 0 50% 0; opacity: 0.18;
          animation: petalFall linear infinite;
        }
        ${[...Array(12)].map((_, i) => `
          .petal-${i} {
            left: ${(i * 8.5) % 100}%; top: -30px;
            background: ${i % 3 === 0 ? '#E7B1A7' : i % 3 === 1 ? '#8A6070' : '#D1C2A6'};
            animation-duration: ${5 + (i * 1.3) % 6}s;
            animation-delay: ${(i * 0.7) % 4}s;
            width: ${10 + (i % 5) * 3}px; height: ${14 + (i % 4) * 4}px;
          }
        `).join('')}
        @keyframes petalFall {
          0%   { transform: translateY(-30px) rotate(0deg);   opacity: 0.18; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }

        .envelope {
          position: relative; width: min(94vw, 680px); border-radius: 32px;
          overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          transition: transform 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.9s ease;
        }
        .openEnvelope { transform: translateY(-60px) scale(0.95); opacity: 0; }
        .flapTop {
          position: absolute; top: 0; left: 0; right: 0; height: 160px;
          background: linear-gradient(160deg, #3D1F35, #2A1520);
          clip-path: polygon(0 0, 100% 0, 50% 100%); z-index: 2;
        }
        .flapBottom {
          position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
          background: linear-gradient(20deg, #2A1520, #3D1F35);
          clip-path: polygon(0 100%, 100% 100%, 50% 0); z-index: 1;
        }
        .envelopeBody {
          position: relative; z-index: 3;
          background: linear-gradient(160deg, #FDF9F5, #F5ECE5);
          padding: 80px 40px 60px; text-align: center; min-height: 400px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .seal {
          width: 90px; height: 90px; border-radius: 50%;
          background: linear-gradient(135deg, var(--ciruela), #4A1A35);
          color: var(--rose-gold); display: flex; align-items: center; justify-content: center;
          font-family: "Cormorant Garamond", serif; font-size: 16px; font-weight: 600;
          letter-spacing: 1px;
          box-shadow: 0 12px 35px rgba(106,44,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
          border: 2px solid rgba(231,177,167,0.4);
          gap: 2px; margin-bottom: 28px; flex-direction: column;
        }
        .sealAmp { font-family: "Great Vibes", cursive; font-size: 20px; line-height: 1; }
        .coverText { max-width: 480px; }
        .coverLabel {
          text-transform: uppercase; letter-spacing: 5px; font-size: 11px;
          color: var(--mauve); margin-bottom: 12px; font-family: "Jost", sans-serif;
        }
        .coverText h1 {
          font-family: "Great Vibes", cursive; font-size: clamp(52px, 10vw, 88px);
          font-weight: 400; color: var(--ciruela); line-height: 1; margin-bottom: 16px;
        }
        .coverDivider {
          display: flex; align-items: center; justify-content: center; gap: 12px; margin: 16px 0;
        }
        .coverDivider span {
          display: block; width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--mauve-light), transparent);
        }
        .coverText p {
          font-family: "Cormorant Garamond", serif; font-size: 19px;
          line-height: 1.65; color: #5D3348; margin-bottom: 28px;
        }

        /* ── BTN ── */
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--ciruela), #4A1A35);
          color: white; text-decoration: none; padding: 14px 34px; border-radius: 999px;
          font-family: "Jost", sans-serif; font-weight: 500; font-size: 14px;
          letter-spacing: 1.5px; text-transform: uppercase; border: none; cursor: pointer;
          box-shadow: 0 10px 28px rgba(106,44,74,0.3); transition: all 0.3s ease;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(106,44,74,0.4); }
        .secondary { background: linear-gradient(135deg, var(--mauve), #6A4858); }
        .secondary:hover { box-shadow: 0 16px 36px rgba(138,96,112,0.4); }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 24px; position: relative;
          background: url("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop") center/cover no-repeat;
          overflow: hidden;
        }
        .heroOverlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(26,10,20,0.72) 0%, rgba(42,21,32,0.82) 60%, rgba(106,44,74,0.55) 100%);
        }
        .heroContent {
          position: relative; z-index: 2; max-width: 820px; padding: 56px 32px;
          border: 1px solid rgba(231,177,167,0.2); background: rgba(26,10,20,0.45);
          backdrop-filter: blur(8px); border-radius: 36px; box-shadow: 0 30px 80px rgba(0,0,0,0.4);
        }
        .heroLabel {
          font-family: "Jost", sans-serif; text-transform: uppercase;
          letter-spacing: 8px; font-size: 13px; color: var(--champagne); margin-bottom: 20px;
        }
        .names {
          font-family: "Great Vibes", cursive; font-size: clamp(72px, 14vw, 140px);
          font-weight: 400; line-height: 0.85; color: #FDF9F5;
          text-shadow: 0 8px 30px rgba(0,0,0,0.4); display: block;
        }
        .amp { display: block; font-size: 0.55em; color: var(--rose-gold); margin: 10px 0; }

        /* ── FECHA – Opción A ── */
        .heroDate { margin: 28px 0 8px; }
        .heroDatePill {
          display: inline-flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(231,177,167,0.35);
          backdrop-filter: blur(6px); border-radius: 999px; padding: 14px 32px;
        }
        .heroDateFrag { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .heroDateFrag strong {
          font-family: "Cormorant Garamond", serif;
          font-size: clamp(24px, 4vw, 38px); font-weight: 300;
          color: #FDF9F5; line-height: 1; letter-spacing: 1px;
        }
        .heroDateFrag small {
          font-family: "Jost", sans-serif; font-size: 9px;
          text-transform: uppercase; letter-spacing: 3px; color: var(--rose-gold); opacity: 0.75;
        }
        .heroDateCenter strong {
          font-size: clamp(20px, 3.5vw, 32px); letter-spacing: 2px; color: var(--champagne);
        }
        .heroDateSep { font-family: "Cormorant Garamond", serif; font-size: 28px; color: rgba(231,177,167,0.4); line-height: 1; }
        .heroDateSub {
          margin-top: 12px; font-family: "Jost", sans-serif; font-size: 12px;
          text-transform: uppercase; letter-spacing: 5px; color: rgba(231,177,167,0.65);
        }

        .heroDivider { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 24px 0; }
        .heroDivider span {
          display: block; flex: 1; max-width: 100px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(231,177,167,0.5), transparent);
        }
        .heroPhrase {
          font-family: "Cormorant Garamond", serif; font-size: clamp(17px, 2.5vw, 23px);
          font-style: italic; color: rgba(253,249,245,0.88); line-height: 1.65;
          max-width: 580px; margin: 0 auto 32px;
        }
        .heroBtn { font-size: 13px; }
        .heroScroll {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: rgba(231,177,167,0.6); font-size: 11px;
          letter-spacing: 3px; text-transform: uppercase; z-index: 2;
        }
        .scrollLine {
          width: 1px; height: 50px;
          background: linear-gradient(to bottom, rgba(231,177,167,0.6), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

        /* ── SECCIONES ── */
        .section { padding: 90px 20px; text-align: center; }
        .mini {
          text-transform: uppercase; letter-spacing: 5px; font-size: 11px;
          color: var(--mauve); margin-bottom: 12px; display: block; font-family: "Jost", sans-serif;
        }
        h2 {
          font-family: "Great Vibes", cursive; font-size: clamp(50px, 8vw, 80px);
          font-weight: 400; color: var(--ciruela); margin: 0 0 36px; line-height: 1;
        }
        .ornament { font-size: 20px; color: var(--mauve-light); margin-bottom: 16px; display: block; }

        /* ── INVITADO ── */
        .guest { background: linear-gradient(160deg, #FDF9F5, #F5ECE5); }
        .guest h2 { margin-bottom: 16px; }
        .passChip {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--ciruela); color: white; padding: 10px 22px;
          border-radius: 999px; font-size: 14px; margin-bottom: 20px;
          box-shadow: 0 6px 18px rgba(106,44,74,0.25);
        }
        .passChip strong { font-weight: 700; }
        .guestNote {
          max-width: 600px; margin: 0 auto; font-family: "Cormorant Garamond", serif;
          font-size: 21px; font-style: italic; line-height: 1.65; color: #5D3348;
        }

        /* ── INTRO ── */
        .intro { max-width: 900px; margin: 0 auto; }
        .textBlock {
          max-width: 720px; margin: 20px auto; padding: 28px;
          border-radius: 24px; background: rgba(253,249,245,0.8);
          border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(138,96,112,0.08);
        }
        .innerBlock { background: #FDF9F5; }
        .textBlock p { font-family: "Cormorant Garamond", serif; font-size: 22px; line-height: 1.75; color: var(--text); margin: 0; }
        .highlight { border-color: var(--mauve-light); background: linear-gradient(135deg, rgba(138,96,112,0.07), rgba(209,194,166,0.07)); }
        .highlight p { color: var(--ciruela); font-weight: 600; font-size: 26px; }

        /* ── COUNTDOWN ── */
        .countdown {
          background: linear-gradient(135deg, var(--ciruela) 0%, #4A1A35 60%, #2A1520 100%);
          color: white; position: relative; overflow: hidden;
        }
        .countdown h2 { color: #FDF9F5; }
        .timer { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; max-width: 680px; margin: 0 auto; }
        .timerCell {
          border-radius: 24px; padding: 28px 12px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(4px); transition: transform 0.2s;
        }
        .timerCell:hover { transform: translateY(-4px); }
        .timerCell strong {
          display: block; font-family: "Cormorant Garamond", serif;
          font-size: 52px; font-weight: 300; color: #FDF9F5; line-height: 1;
        }
        .timerCell span {
          display: block; margin-top: 8px; text-transform: uppercase;
          letter-spacing: 3px; font-size: 11px; color: var(--rose-gold); font-family: "Jost", sans-serif;
        }

        /* ── GALERÍA ── */
        .gallerySection { background: linear-gradient(160deg, #FDF9F5, #F5ECE5); }
        .sectionText {
          max-width: 580px; margin: -16px auto 36px;
          font-family: "Cormorant Garamond", serif; font-size: 20px;
          font-style: italic; line-height: 1.65; color: #5D3348;
        }
        .gallery {
          display: grid; grid-template-columns: 1fr 1.45fr 1fr; gap: 16px;
          max-width: 960px; margin: 0 auto; align-items: center;
        }
        .galleryItem {
          position: relative; border-radius: 28px; overflow: hidden;
          box-shadow: 0 20px 50px rgba(106,44,74,0.18);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .galleryItem:hover { transform: translateY(-6px); box-shadow: 0 30px 70px rgba(106,44,74,0.28); }
        .galleryLeft img, .galleryRight img { height: 300px; }
        .galleryCenter {
          transform: translateY(-12px);
          box-shadow: 0 30px 70px rgba(106,44,74,0.28);
          border: 3px solid var(--mauve-light);
        }
        .galleryCenter img { height: 400px; }
        .galleryCenter:hover { transform: translateY(-18px); }
        .galleryItem img { width: 100%; object-fit: cover; display: block; transition: transform 0.6s ease; }
        .galleryItem:hover img { transform: scale(1.04); }
        .galleryOverlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(106,44,74,0.5) 0%, transparent 50%);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .galleryItem:hover .galleryOverlay { opacity: 1; }
        .galleryTag {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          background: rgba(26,10,20,0.75); color: var(--rose-gold);
          padding: 6px 16px; border-radius: 999px; font-size: 12px;
          font-family: "Jost", sans-serif; letter-spacing: 1px; white-space: nowrap; backdrop-filter: blur(4px);
        }

        /* ── DETALLES ── */
        .details { background: var(--ivory); }
        .detailsGrid { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; max-width: 900px; margin: 0 auto; }

        /* ── CARD ── */
        .card {
          max-width: 640px; margin: 20px auto; padding: 40px 28px;
          background: var(--card-bg); border-radius: 32px; border: 1px solid var(--border);
          box-shadow: 0 20px 55px rgba(106,44,74,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 28px 70px rgba(106,44,74,0.15); }
        .cardIcon { font-size: 36px; margin-bottom: 16px; display: block; }
        .cardTop { text-transform: uppercase; letter-spacing: 4px; font-size: 11px; color: var(--mauve); display: block; margin-bottom: 10px; }
        .card h3 { font-family: "Cormorant Garamond", serif; font-size: 30px; color: var(--text); margin: 0 0 8px; }
        .card p { font-size: 16px; line-height: 1.65; color: #5D3348; margin: 8px 0; }
        .hour { font-size: 20px !important; color: var(--ciruela) !important; font-weight: 600; font-family: "Cormorant Garamond", serif; }
        .cardLink {
          display: inline-flex; align-items: center; gap: 6px; color: var(--ciruela);
          font-weight: 600; font-size: 14px; text-decoration: none; margin: 8px 0 16px; transition: gap 0.2s;
        }
        .cardLink:hover { gap: 10px; }
        .mapEmbed { border-radius: 16px; overflow: hidden; margin-top: 12px; }
        .mapEmbed iframe { border: none; display: block; }

        /* ── TIMELINE ── */
        .itinerary { background: linear-gradient(160deg, #FDF9F5, #F5ECE5); }
        .timeline { max-width: 680px; margin: 0 auto; position: relative; }
        .timeline::before {
          content: ''; position: absolute; left: 50%; top: 20px; bottom: 20px;
          width: 1px; background: linear-gradient(to bottom, transparent, var(--mauve-light), transparent);
          transform: translateX(-50%);
        }
        .timelineItem {
          display: grid; grid-template-columns: 1fr 60px 1fr;
          gap: 20px; align-items: center; margin-bottom: 36px;
        }
        .timelineTime { font-family: "Cormorant Garamond", serif; font-size: 20px; font-weight: 600; color: var(--ciruela); text-align: right; }
        .timelineDot {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, var(--mauve), var(--ciruela));
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          box-shadow: 0 6px 18px rgba(106,44,74,0.25); z-index: 1; justify-self: center;
        }
        .timelineContent { text-align: left; }
        .timelineContent strong { font-family: "Cormorant Garamond", serif; font-size: 20px; color: var(--text); display: block; }
        .timelineContent p { font-size: 14px; color: var(--mauve); margin: 4px 0 0; }

        /* ── DRESS ── */
        .dress {
          background: linear-gradient(135deg, #2A1520 0%, var(--ciruela) 50%, #4A1A35 100%);
          color: white; position: relative; overflow: hidden;
        }
        .dress::before { content: '✦'; position: absolute; top: 30px; left: 40px; font-size: 60px; color: rgba(138,96,112,0.12); }
        .dress::after  { content: '✦'; position: absolute; bottom: 30px; right: 40px; font-size: 60px; color: rgba(138,96,112,0.12); }
        .dress h2 { color: #FDF9F5; }
        .dressType {
          font-family: "Cormorant Garamond", serif; font-size: 48px; font-weight: 300;
          letter-spacing: 8px; color: var(--champagne); text-transform: uppercase; margin-bottom: 12px;
        }
        .dressSub { font-size: 14px; color: rgba(253,249,245,0.65); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 36px; }
        .colorSwatches { display: flex; justify-content: center; gap: 32px; margin-bottom: 32px; flex-wrap: wrap; }
        .swatch { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .swatchColor { width: 70px; height: 70px; border-radius: 50%; box-shadow: 0 8px 24px rgba(0,0,0,0.3); transition: transform 0.3s ease; }
        .swatch:hover .swatchColor { transform: scale(1.12) translateY(-4px); }
        .swatch span { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--champagne); font-family: "Jost", sans-serif; }
        .dressNote { font-family: "Cormorant Garamond", serif; font-size: 18px; font-style: italic; color: rgba(253,249,245,0.7); margin-top: 8px; }

        /* ── REGALO ── */
        .gift { background: linear-gradient(160deg, #FDF9F5, #F5ECE5); }
        .bank { margin-top: 24px; border-radius: 20px; background: linear-gradient(135deg, var(--ivory), #F5ECE5); border: 1px solid var(--border); overflow: hidden; }
        .bankRow {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid var(--border); transition: background 0.2s;
        }
        .bankRow:last-child { border-bottom: none; }
        .bankRow:hover { background: rgba(138,96,112,0.06); }
        .bankLabel { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: var(--mauve); margin-bottom: 3px; font-family: "Jost", sans-serif; }
        .bankValue { font-family: "Cormorant Garamond", serif; font-size: 18px; color: var(--text); font-weight: 600; }
        .copyBtn {
          background: none; border: 1px solid var(--border); border-radius: 8px;
          padding: 6px 8px; cursor: pointer; color: var(--mauve);
          transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .copyBtn:hover { background: var(--mauve); color: white; border-color: var(--mauve); }

        /* ── FOTOS ── */
        .photos { background: var(--ivory); }
        .qr {
          width: 180px; max-width: 90%; margin: 24px auto; display: block;
          border-radius: 16px; padding: 12px; background: white;
          box-shadow: 0 12px 32px rgba(106,44,74,0.15);
        }

        /* ── RSVP ── */
        .rsvp { background: linear-gradient(160deg, #FDF9F5, #F5ECE5); position: relative; overflow: hidden; }
        .rsvpDesc { font-family: "Cormorant Garamond", serif; font-size: 21px; font-style: italic; color: #5D3348; max-width: 500px; margin: -16px auto 40px; line-height: 1.65; }
        .rsvpCards { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .rsvpCard {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 36px 44px; border-radius: 28px; border: none; cursor: pointer;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); font-family: "Jost", sans-serif;
        }
        .rsvpCard.loading { opacity: 0.7; pointer-events: none; }
        .rsvpYes { background: linear-gradient(135deg, var(--ciruela), #4A1A35); color: white; box-shadow: 0 16px 40px rgba(106,44,74,0.35); }
        .rsvpNo  { background: white; color: var(--text); border: 2px solid var(--border); box-shadow: 0 8px 24px rgba(106,44,74,0.1); }
        .rsvpCard:hover { transform: translateY(-6px) scale(1.02); }
        .rsvpYes:hover { box-shadow: 0 24px 52px rgba(106,44,74,0.45); }
        .rsvpNo:hover  { border-color: var(--mauve); }
        .rsvpEmoji { font-size: 40px; display: block; }
        .rsvpCard strong { font-size: 18px; font-weight: 600; font-family: "Cormorant Garamond", serif; }
        .rsvpCard span  { font-size: 13px; opacity: 0.75; letter-spacing: 0.5px; }
        .rsvpConfirmed {
          background: white; border: 1px solid var(--border); border-radius: 28px;
          padding: 48px 36px; max-width: 480px; margin: 0 auto; box-shadow: 0 20px 55px rgba(106,44,74,0.12);
        }
        .rsvpHeart { font-size: 52px; display: block; margin-bottom: 16px; }
        .rsvpConfirmed h3 { font-family: "Great Vibes", cursive; font-size: 48px; color: var(--ciruela); margin-bottom: 12px; font-weight: 400; }
        .rsvpConfirmed p { font-family: "Cormorant Garamond", serif; font-size: 19px; color: #5D3348; line-height: 1.65; }

        /* ── BUZÓN ── */
        .messages {
          background: linear-gradient(135deg, #2A1520 0%, #3D1F35 60%, var(--ciruela) 100%);
          position: relative; overflow: hidden;
        }
        .messages::before {
          content: '"'; position: absolute; top: -20px; left: 30px;
          font-size: 240px; color: rgba(138,96,112,0.06);
          font-family: "Cormorant Garamond", serif; line-height: 1;
        }
        .messages .mini { color: var(--mauve-light); }
        .messages h2   { color: #FDF9F5; }
        .messages .sectionText { color: rgba(253,249,245,0.75); }
        .wishForm { position: relative; z-index: 1; }
        .wishCard {
          max-width: 640px; margin: 0 auto; background: rgba(253,249,245,0.95);
          border-radius: 32px; padding: 40px 36px; box-shadow: 0 30px 80px rgba(0,0,0,0.3);
          position: relative; overflow: hidden;
        }
        .wishCard::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--rose-gold), var(--mauve), var(--ciruela));
        }
        .wishHeader { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: var(--ciruela); font-family: "Cormorant Garamond", serif; font-size: 20px; font-style: italic; }
        .wishLines { display: flex; flex-direction: column; position: absolute; inset: 80px 36px 40px; pointer-events: none; }
        .wishLine { flex: 1; border-bottom: 1px solid rgba(138,96,112,0.12); }
        .wishTextarea {
          position: relative; z-index: 1; width: 100%; border: none; background: transparent;
          font-family: "Cormorant Garamond", serif; font-size: 20px; line-height: 2;
          color: var(--text); resize: none; outline: none; padding: 4px 0;
        }
        .wishTextarea::placeholder { color: rgba(93,51,72,0.35); font-style: italic; }
        .wishFooter {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); position: relative; z-index: 1;
        }
        .wishFrom { font-family: "Cormorant Garamond", serif; font-size: 18px; font-style: italic; color: var(--mauve); }
        .wishBtn { font-size: 13px; }
        .wishBtn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
        .wishSentMsg {
          max-width: 480px; margin: 0 auto; background: rgba(253,249,245,0.95);
          border-radius: 28px; padding: 48px 36px; box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        }
        .wishSentIcon { font-size: 52px; display: block; margin-bottom: 16px; }
        .wishSentMsg h3 { font-family: "Great Vibes", cursive; font-size: 52px; color: var(--ciruela); font-weight: 400; margin-bottom: 12px; }
        .wishSentMsg p  { font-family: "Cormorant Garamond", serif; font-size: 19px; color: #5D3348; line-height: 1.65; }

        /* ── FOOTER ── */
        footer { background: linear-gradient(135deg, #1C0D18, #2A1520); color: var(--rose-gold); text-align: center; padding: 52px 20px; }
        .footerContent { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .footerNames { font-family: "Great Vibes", cursive; font-size: 52px; font-weight: 400; color: #FDF9F5; line-height: 1; }
        .footerHeart { color: var(--mauve); font-size: 20px; }
        .footerDate { font-family: "Cormorant Garamond", serif; font-size: 18px; letter-spacing: 4px; color: var(--champagne); }
        .footerNote { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: rgba(231,177,167,0.45); margin-top: 8px; font-family: "Jost", sans-serif; }

        /* ════════════════════════════════════
           RESPONSIVE — TABLET  (≤ 900px)
        ════════════════════════════════════ */
        @media (max-width: 900px) {
          .detailsGrid { grid-template-columns: 1fr; max-width: 560px; margin: 0 auto; }
          .gallery { grid-template-columns: 1fr 1.3fr 1fr; }
          .galleryLeft img, .galleryRight img { height: 240px; }
          .galleryCenter img { height: 340px; }
        }

        /* ════════════════════════════════════
           RESPONSIVE — MÓVIL  (≤ 768px)
        ════════════════════════════════════ */
        @media (max-width: 768px) {
          /* TEST banner ocupa espacio en móvil */
          body { padding-top: 0; }

          /* Sobre */
          .envelopeBody { padding: 70px 24px 48px; }
          .seal { width: 76px; height: 76px; font-size: 14px; }
          .coverText h1 { font-size: 52px; }
          .coverText p  { font-size: 17px; }

          /* Hero */
          .heroContent { padding: 36px 20px; border-radius: 24px; }
          .names { font-size: 76px; line-height: 0.88; }
          .heroDatePill { gap: 10px; padding: 12px 22px; }
          .heroDateFrag strong { font-size: 22px; }
          .heroDateCenter strong { font-size: 20px; }
          .heroPhrase { font-size: 18px; }

          /* Contador */
          .timer { grid-template-columns: repeat(2,1fr); max-width: 380px; }
          .timerCell strong { font-size: 44px; }

          /* Galería: columna única en móvil */
          .gallery { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; gap: 12px; }
          .galleryLeft img, .galleryRight img { height: 220px; }
          .galleryCenter { transform: none; border-width: 2px; }
          .galleryCenter img { height: 280px; }

          /* Timeline */
          .timeline::before { left: 18px; }
          .timelineItem { grid-template-columns: 18px 1fr; grid-template-rows: auto auto; gap: 8px 14px; }
          .timelineTime { grid-column: 2; grid-row: 1; text-align: left; font-size: 15px; }
          .timelineDot  { grid-column: 1; grid-row: 1/3; width: 36px; height: 36px; font-size: 15px; align-self: start; justify-self: start; }
          .timelineContent { grid-column: 2; grid-row: 2; }

          /* Dress */
          .dressType { font-size: 36px; letter-spacing: 5px; }
          .colorSwatches { gap: 20px; }
          .swatchColor { width: 58px; height: 58px; }

          /* RSVP */
          .rsvpCards { flex-direction: column; max-width: 300px; margin: 0 auto; }
          .rsvpCard { padding: 28px 32px; }

          /* Buzón */
          .wishCard { padding: 28px 20px; }
          .wishLines { inset: 76px 20px 36px; }
          .wishFooter { flex-direction: column; gap: 16px; align-items: flex-start; }
          .wishBtn { width: 100%; justify-content: center; }

          /* Banco */
          .bankValue { font-size: 15px; }

          /* Misc */
          h2 { font-size: 52px; }
          .section { padding: 72px 16px; }
          .musicControls { bottom: 16px; right: 14px; }
          .musicBtn { width: 42px; height: 42px; }
          .musicReplay { width: 34px; height: 34px; }
        }

        /* ════════════════════════════════════
           RESPONSIVE — MÓVIL PEQUEÑO (≤ 390px)
        ════════════════════════════════════ */
        @media (max-width: 390px) {
          .names { font-size: 62px; }
          .heroDatePill { flex-direction: column; gap: 6px; border-radius: 20px; padding: 14px 20px; }
          .heroDateSep  { display: none; }
          .heroDateFrag { flex-direction: row; gap: 8px; align-items: baseline; }
          .heroDateFrag small { font-size: 8px; }
          .timerCell strong { font-size: 36px; }
          .coverText h1 { font-size: 44px; }
          .textBlock p  { font-size: 19px; }
          .highlight p  { font-size: 22px; }
          .card { padding: 28px 18px; }
          .btn  { padding: 13px 24px; font-size: 13px; }
        }
      `}</style>
    </main>
  );
}