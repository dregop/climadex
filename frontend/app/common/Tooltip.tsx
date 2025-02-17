import React, { useState } from "react";
import "./Tooltip.css";

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className={`tooltip-container ${show ? "show" : ""}`}
      onClick={() => setShow(!show)}
      onMouseLeave={() => setShow(false)} // Cache au survol hors de l'élément
    >
      {/* Bouton d'info */}
      <button className="tooltip-button">ℹ️</button>

      {/* Bulle d'info */}
      <div className="tooltip-bubble">{text}</div>
    </div>
  );
};

export default Tooltip;
