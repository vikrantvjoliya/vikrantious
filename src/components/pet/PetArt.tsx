import { useId } from "react";
import type { PetSettings } from "./usePetSettings";

/** Layered vector artwork: facial and body groups animate without scaling the hitbox. */
export default function PetArt({ character }: Pick<PetSettings, "character">) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 200 240"
      className="pet-art"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-skin`} x2="0.8" y2="1">
          <stop stopColor="#f5edda" />
          <stop offset="1" stopColor="#b7ab95" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x2="0.6" y2="1">
          <stop stopColor="#ffe99b" />
          <stop offset=".6" stopColor="#ffd05b" />
          <stop offset="1" stopColor="#e6973f" />
        </linearGradient>
        <linearGradient id={`${id}-beard`} x2=".8" y2="1">
          <stop stopColor="#51443c" />
          <stop offset="1" stopColor="#251f20" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x2="0" y2="1">
          <stop stopColor="#201f2c" />
          <stop offset="1" stopColor="#596d91" />
        </linearGradient>
      </defs>
      <ellipse
        className="pet-shadow"
        cx="100"
        cy="227"
        rx="59"
        ry="8"
        fill="#182225"
        opacity=".17"
      />
      <g
        className="pet-body"
        stroke="#45362c"
        strokeWidth="2.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {character === "warrior" ? (
          <>
            <path
              d="M58 187 46 214Q50 230 83 220L93 194M116 191l6 30q34 7 33-11l-13-28"
              fill="#665f56"
            />
            <path
              d="m49 207 34-5m-31 15 29-7m43-8 27 7m-25 3 27 8"
              stroke="#b1884e"
              strokeWidth="7"
            />
            <path
              d="M53 126Q32 130 28 176q0 17 14 17l17-31m87-35q21 1 24 48 0 17-15 18l-15-33"
              fill={`url(#${id}-skin)`}
            />
            <path
              d="m34 147-8 29 21 7 13-33m83-4 9 36 21-8-9-29"
              fill="#8c522b"
            />
            <path
              d="m31 155 22 8m-25 5 22 8m101-20 22-5m-20 18 21-6"
              stroke="#c28a46"
              strokeWidth="5"
            />
            <path
              d="M62 111q36-14 75 0l17 75q-43 33-106 2Z"
              fill={`url(#${id}-skin)`}
            />
            <path
              d="m116 114 19 52-13 9-23-58"
              fill="var(--pet-accent)"
              stroke="none"
            />
            <path d="m51 159 100-4 3 35q-40 29-109 0Z" fill="#704321" />
            <path d="m47 166 106-2-1 13-107 2Z" fill="#ad7a38" />
            <rect x="84" y="164" width="27" height="17" rx="4" fill="#c6b17b" />
            <path d="m69 182 58 0-8 39-35 1Z" fill="#9c632e" />
            <path d="m77 190 40 0m-36 9 31 0m-26 10 22 0" stroke="#bb8949" />
            <path
              d="m54 177-9 16 15 9 13-20m56-1 7 20 16-6-6-18"
              fill="var(--pet-accent)"
            />
            <path d="M54 113 30 122l4 18 32 6 10-20Z" fill="#81754d" />
            <path
              d="m32 129 29 9 10-12"
              fill="none"
              stroke="#d0b573"
              strokeWidth="4"
            />
            <ellipse
              cx="47"
              cy="76"
              rx="11"
              ry="20"
              fill={`url(#${id}-skin)`}
            />
            <ellipse
              cx="153"
              cy="76"
              rx="11"
              ry="20"
              fill={`url(#${id}-skin)`}
            />
            <path
              d="M48 70Q46 10 99 9q57 0 55 61l-5 48q-46 44-99-2Z"
              fill={`url(#${id}-skin)`}
            />
            <path
              d="m119 12-8 24 16 15-5 40 20 9 8-19-11-5 3-35-17-12 6-15Z"
              fill="var(--pet-accent)"
              stroke="none"
            />
            <g className="pet-eyes">
              <path
                d="M54 63 91 72q-1 25-23 21Q51 89 54 63m91 0-36 9q1 25 22 21 17-4 14-30"
                fill="#fffdf0"
              />
              <ellipse cx="74" cy="77" rx="10" ry="12" fill="#daa542" />
              <ellipse cx="126" cy="77" rx="10" ry="12" fill="#daa542" />
              <ellipse cx="76" cy="76" rx="4" ry="7" fill="#252326" />
              <ellipse cx="124" cy="76" rx="4" ry="7" fill="#252326" />
              <circle cx="79" cy="72" r="3" fill="white" stroke="none" />
              <circle cx="127" cy="72" r="3" fill="white" stroke="none" />
            </g>
            <path
              d="m52 57 14-2 29 18-9 5-23-13Zm96 0-14-2-29 18 9 5 23-13Z"
              fill="#423a32"
            />
            <path
              d="m47 85 13 19q39-24 81-1l13-18 4 57-11-5-9 24-10-4-27 34-27-33-10 4-12-23-10 3Z"
              fill={`url(#${id}-beard)`}
            />
            <path
              d="M63 112q20-21 38-8 19-14 38 8l-22 10-17-11-17 11Z"
              fill="#59483a"
            />
            <path
              className="pet-mouth"
              d="m94 125 12 0"
              stroke="#edcfad"
              strokeWidth="3"
            />
            <path
              d="m79 134 19 42m25-42-19 37"
              fill="none"
              stroke="#6e5947"
              opacity=".5"
            />
          </>
        ) : (
          <>
            <path
              className="pet-tail"
              d="m134 159 25 13-3-32 26 3 11-44-44 5-10 48-14-10"
              fill={`url(#${id}-gold)`}
              strokeWidth="4"
            />
            <path d="m135 162 20 14 2-20-13-6-5 10" fill="#805033" />
            <path
              className="pet-ear left"
              d="M62 70Q24 13 35 8q22-2 50 53"
              fill={`url(#${id}-gold)`}
            />
            <path
              className="pet-ear right"
              d="M116 54q32-40 66-32 0 18-51 52"
              fill={`url(#${id}-gold)`}
            />
            <path
              d="M35 8q-8 1 4 31l16-12Q40 6 35 8m125 18-10 24q29-17 32-28Z"
              fill="#2d2930"
            />
            <path
              d="M55 199q-21 5-26 17 16 8 42-3m47-10q24 1 25 17-19 7-36-9"
              fill={`url(#${id}-gold)`}
            />
            <path
              d="M54 113q-11 31-15 56-9 43 42 45 62 4 56-42l-9-67Z"
              fill={`url(#${id}-gold)`}
            />
            <path
              d="M47 64q25-32 63-19 28 9 30 38l-4 37q-12 27-55 23-46-3-49-29-5-23 15-50Z"
              fill={`url(#${id}-gold)`}
            />
            <ellipse
              cx="46"
              cy="112"
              rx="10"
              ry="13"
              fill="var(--pet-accent)"
              stroke="none"
            />
            <ellipse
              cx="121"
              cy="114"
              rx="13"
              ry="14"
              fill="var(--pet-accent)"
              stroke="none"
            />
            <g className="pet-glasses">
              <path
                d="M30 81q24-13 55 0 22-12 52 0l-3 23q-5 16-25 15-21-3-22-26h-7q-2 25-24 24-23-1-26-22Z"
                fill="#26242d"
                stroke="#fff5d6"
                strokeWidth="5"
              />
              <path
                d="M32 81q23-11 47 2l-3 18q-6 17-25 10-18-5-19-30m58 3q21-13 43 0l-3 22q-13 17-30 5-7-6-10-27Z"
                fill={`url(#${id}-glass)`}
              />
              <path d="m43 88 9-4m51 5 9-5" stroke="white" strokeWidth="5" />
              <path d="m135 87 10 10" stroke="#24232b" strokeWidth="6" />
            </g>
            <path d="m79 118 4 1" strokeWidth="3" />
            <path
              className="pet-mouth"
              d="m72 126q6 8 12 0 7 8 13 0"
              fill="none"
            />
            <path
              d="M51 151q17-13 54 5l-23 18q-29 4-36-11m73-11q-12-7-50 9l13 13q35 1 42-12"
              fill={`url(#${id}-gold)`}
            />
            <path d="m50 184 5 6m49 6 11-4" stroke="#e39d44" />
          </>
        )}
      </g>
    </svg>
  );
}
