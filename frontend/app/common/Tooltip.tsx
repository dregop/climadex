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
      onMouseLeave={() => setShow(false)}
    >
      <button className="tooltip-button">ℹ️</button>

      <div className="tooltip-bubble">{text}</div>
    </div>
  );
};

export default Tooltip;
