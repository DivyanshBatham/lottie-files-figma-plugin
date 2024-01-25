import { useMemo, useRef, useState } from "react";
import { Sketch } from "@uiw/react-color";
import classNames from "classnames";

type ColorPickerProps = {
  color: string;
  placement: "top-right" | "bottom-right";
  setColor: (color: string) => void;
};

const TransparentIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || "text-black"}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 0.25C1.0335 0.25 0.25 1.0335 0.25 2V16C0.25 16.9665 1.0335 17.75 2 17.75H16C16.9665 17.75 17.75 16.9665 17.75 16V2C17.75 1.0335 16.9665 0.25 16 0.25H2ZM1.75 16V13H5V9H1.75V5H5V1.75H9V5H13V1.75H16C16.1381 1.75 16.25 1.86193 16.25 2V5H13V9H16.25V13H13V16.25H9V13H5V16.25H2C1.86193 16.25 1.75 16.1381 1.75 16Z"
        fill="currentColor"
      ></path>
      <path d="M9 9V13H13V9H9Z" fill="currentColor"></path>
      <path d="M9 9V5H5V9H9Z" fill="currentColor"></path>
    </svg>
  );
};

export const ColorPicker = ({
  color,
  setColor,
  placement,
}: ColorPickerProps) => {
  const [localColor, setLocalColor] = useState(color);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target as Node)
    ) {
      setColorPickerOpen(false);
    }
  };

  const openColorPicker = () => {
    setColorPickerOpen(true);
    document.addEventListener("mousedown", handleClickOutside);
  };

  const closeColorPicker = () => {
    setColorPickerOpen(false);
    document.removeEventListener("mousedown", handleClickOutside);
  };

  const toggleColorPicker = () => {
    if (colorPickerOpen) closeColorPicker();
    else openColorPicker();
  };

  const isTransparent = useMemo(() => color === "transparent", [color]);

  return (
    <div className="inline-flex gap-2 items-center">
      <button
        onClick={() => {
          setColor(isTransparent ? localColor : "transparent");
        }}
      >
        <TransparentIcon
          className={classNames({ "text-teal-400": isTransparent })}
        />
      </button>
      <button
        className="relative inline-flex gap-1 items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 font-mono"
        onClick={toggleColorPicker}
      >
        {colorPickerOpen && (
          <Sketch
            className={classNames("absolute", {
              "bottom-full left-0 -translate-y-2": placement === "top-right",
              "top-full left-0 translate-y-2": placement === "bottom-right",
            })}
            ref={colorPickerRef}
            color={localColor}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(color) => {
              setLocalColor(color.hexa);
              setColor(color.hexa);
            }}
          />
        )}
        <div
          className={classNames("h-4 w-4 rounded-full border", {
            "bg-chequered-small": localColor.slice(-2) !== "ff",
          })}
          style={{
            backgroundColor:
              color === "transparent" ? "transparent" : localColor,
          }}
        />
        {localColor}
      </button>
    </div>
  );
};
