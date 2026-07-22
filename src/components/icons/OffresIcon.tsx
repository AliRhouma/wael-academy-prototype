/**
 * Gem/diamond glyph (from `svg icons/offres.svg`), recolored to the Wael brand
 * via design tokens: the body + facets ride the brand ramp (`--brand-*`) and the
 * sparkles ride the accent (`--accent-*` = the "reward / kicker" accent). All
 * token-driven, so the gem follows whatever palette is active (data-palette).
 * Carries its own fill — mark its NavItem `colored: true` so the shell forces it
 * white on the active gradient pill.
 */
export function OffresIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipPath="url(#offresClip)">
        <path d="M25.1157 10.5624L21.6506 5.23938C21.4818 4.97999 21.2128 4.80232 20.9079 4.74895L19.0763 4.42808C15.1567 3.74142 11.1475 3.74142 7.22796 4.42808L5.39639 4.74895C5.09153 4.80238 4.8225 4.97999 4.65366 5.23938L1.18852 10.5624C0.925255 10.9669 0.951765 11.4947 1.25418 11.8708L12.2824 25.583C12.7292 26.1385 13.575 26.1385 14.0218 25.583L25.05 11.8707C25.3524 11.4947 25.3789 10.9669 25.1157 10.5624Z" fill="url(#offresG0)" />
        <path d="M25.1152 10.5625L21.6501 5.23933C21.4813 4.97994 21.2123 4.80238 20.9075 4.74895L19.0758 4.42808C15.1562 3.74142 11.1471 3.74142 7.22748 4.42808L5.39586 4.74895C5.091 4.80238 4.82207 4.97999 4.65318 5.23933L1.18809 10.5625C1.05396 10.7686 0.995487 11.0066 1.00996 11.2404H25.2934C25.3079 11.0066 25.2494 10.7686 25.1152 10.5625Z" fill="url(#offresG1)" />
        <path d="M21.3775 4.95205C21.2397 4.85019 21.0797 4.77918 20.9074 4.74895L19.0758 4.42808C15.1562 3.74142 11.147 3.74142 7.22744 4.42808L5.39582 4.74895C5.22356 4.77913 5.06358 4.85014 4.92578 4.95205L5.34295 11.2404L12.7834 25.9371C13.0214 26.0198 13.2819 26.0198 13.5199 25.9371L20.9603 11.2404L21.3775 4.95205Z" fill="url(#offresG2)" />
        <path d="M5.34375 11.2404L12.7842 25.9371C13.0222 26.0198 13.2827 26.0198 13.5206 25.9371L20.9611 11.2404C20.9611 11.2404 14.4002 3.91309 13.1524 3.91309C11.9047 3.91314 5.34375 11.2404 5.34375 11.2404Z" fill="url(#offresG3)" />
        <path d="M5.3427 11.2409L12.7832 25.9373C12.5936 25.8721 12.4191 25.7543 12.2817 25.5836L1.25351 11.8714C1.08186 11.658 0.999678 11.3957 1.00845 11.1348C1.00727 11.1701 1.00778 11.2055 1.00998 11.2409H5.3427V11.2409Z" fill="url(#offresG4)" />
        <path d="M20.9601 11.2409L13.5195 25.9372C13.7092 25.8721 13.8837 25.7542 14.0211 25.5835L25.0493 11.8714C25.2209 11.658 25.3031 11.3957 25.2943 11.1348C25.2955 11.1701 25.295 11.2055 25.2928 11.2409H20.9601V11.2409Z" fill="url(#offresG5)" />
        <path d="M13.1517 3.91309C11.9041 3.91309 5.3428 11.2403 5.3428 11.2403L4.92578 4.95242C5.06343 4.85005 5.2234 4.7795 5.39577 4.74891L7.22744 4.42834C9.18723 4.08484 11.1695 3.91309 13.1517 3.91309Z" fill="url(#offresG6)" />
        <path d="M14.022 25.583L25.0502 11.8707C25.3526 11.4947 25.3791 10.9668 25.1159 10.5624L21.6508 5.23939C21.482 4.98 21.213 4.80239 20.9081 4.74896L19.0765 4.42809C17.1167 4.08474 15.1345 3.91309 13.1523 3.91309V25.9996C13.4755 25.9996 13.7986 25.8608 14.022 25.583Z" fill="url(#offresG7)" />
        <path d="M22.3831 15.1892L11.1656 3.97168C11.1654 3.97168 11.1652 3.97173 11.165 3.97173C11.0006 3.98126 10.8362 3.99197 10.6719 4.0039C10.6718 4.0039 10.6717 4.0039 10.6716 4.0039C10.3477 4.02735 10.024 4.05549 9.70071 4.08812C9.68674 4.08955 9.67277 4.09102 9.6588 4.09245C9.51606 4.10703 9.37336 4.12263 9.23072 4.139C9.21022 4.14134 9.18978 4.14364 9.16929 4.14598C8.86244 4.18182 8.55589 4.22184 8.24986 4.26599C8.21346 4.27124 8.17706 4.2767 8.14066 4.2821C8.02534 4.29913 7.91007 4.31671 7.79486 4.33497C7.75422 4.34139 7.71354 4.34771 7.67291 4.35429C7.52497 4.3782 7.37712 4.40277 7.22943 4.42867L6.81348 4.50152L6.55078 4.54755C6.65259 4.63952 6.75159 4.73455 6.84932 4.83085L6.83637 4.83315C6.90372 4.89397 6.96974 4.95616 7.03525 5.01887C7.0665 5.05144 7.09714 5.08463 7.12788 5.11767L7.12191 5.11874C7.14083 5.13582 7.15903 5.15366 7.17779 5.17089C7.54041 5.56635 7.86995 5.9927 8.16069 6.44637L19.9579 18.2046L22.3831 15.1892Z" fill="url(#offresG8)" />
        <path d="M19.1944 19.153L6.53609 6.44239C6.45594 6.31738 6.27048 6.31738 6.19039 6.44239C5.83409 6.99838 5.36308 7.47392 4.81071 7.83532C4.6881 7.91552 4.6881 8.09848 4.81071 8.17868L17.6925 21.0204L19.1944 19.153Z" fill="url(#offresG9)" />
        <path d="M24.9531 11.9931L23.425 13.8936L20.8957 11.3725L18.807 9.29028C18.6841 9.20968 18.6841 9.02677 18.807 8.94678C19.3594 8.58563 19.8305 8.10978 20.1864 7.55394C20.267 7.42863 20.4522 7.42863 20.5322 7.55394L24.2031 11.2402L24.9531 11.9931Z" fill="url(#offresG10)" />
        <path d="M11.6091 3.66018C10.5043 4.38298 9.56232 5.33412 8.84962 6.4461C8.68934 6.69616 8.31845 6.69616 8.15817 6.4461C7.44552 5.33412 6.50355 4.38303 5.39876 3.66018C5.15354 3.49974 5.15354 3.13391 5.39876 2.97347C6.50355 2.25067 7.44552 1.29953 8.15817 0.187544C8.3184 -0.0625147 8.68934 -0.0625147 8.84962 0.187544C9.56227 1.29953 10.5043 2.25067 11.6091 2.97347C11.8543 3.13391 11.8543 3.49969 11.6091 3.66018Z" fill="url(#offresG11)" />
        <path d="M7.91582 8.1796C7.36345 8.541 6.89244 9.0166 6.53609 9.57259C6.45594 9.69759 6.27048 9.69759 6.19039 9.57259C5.83409 9.0166 5.36308 8.54105 4.81071 8.17965C4.6881 8.09941 4.6881 7.91654 4.81071 7.8363C5.36308 7.4749 5.83409 6.99935 6.19039 6.44336C6.27053 6.31836 6.456 6.31836 6.53609 6.44336C6.89244 6.99935 7.36345 7.4749 7.91582 7.8363C8.03843 7.91644 8.03843 8.09936 7.91582 8.1796Z" fill="url(#offresG12)" />
        <path d="M24.3221 14.5048C23.7697 14.8662 23.2987 15.3418 22.9423 15.8978C22.8622 16.0228 22.6767 16.0228 22.5966 15.8978C22.2403 15.3418 21.7693 14.8662 21.217 14.5048C21.0943 14.4246 21.0943 14.2417 21.217 14.1615C21.7693 13.8001 22.2403 13.3245 22.5966 12.7686C22.6768 12.6436 22.8622 12.6436 22.9423 12.7686C23.2987 13.3245 23.7697 13.8001 24.3221 14.1615C24.4447 14.2416 24.4447 14.4246 24.3221 14.5048Z" fill="url(#offresG13)" />
        <path d="M3.90019 16.163C3.34782 16.5244 2.87681 17 2.52046 17.556C2.44032 17.681 2.25485 17.681 2.17476 17.556C1.81846 17 1.34745 16.5245 0.795081 16.1631C0.672473 16.0828 0.672473 15.8999 0.795081 15.8197C1.34745 15.4583 1.81846 14.9827 2.17476 14.4268C2.2549 14.3018 2.44037 14.3018 2.52046 14.4268C2.87681 14.9828 3.34782 15.4583 3.90019 15.8197C4.0228 15.8999 4.0228 16.0828 3.90019 16.163Z" fill="url(#offresG14)" />
        <path d="M21.9119 9.28995C21.3595 9.65135 20.8885 10.1269 20.5322 10.6829C20.452 10.8079 20.2666 10.8079 20.1865 10.6829C19.8302 10.1269 19.3592 9.6514 18.8068 9.29C18.6842 9.20976 18.6842 9.02689 18.8068 8.94665C19.3592 8.58525 19.8302 8.10971 20.1865 7.55371C20.2666 7.42871 20.4521 7.42871 20.5322 7.55371C20.8885 8.10971 21.3595 8.58525 21.9119 8.94665C22.0345 9.02679 22.0345 9.20971 21.9119 9.28995Z" fill="url(#offresG15)" />
      </g>
      <defs>
        {/* Main gem body — palest brand tints */}
        <linearGradient id="offresG0" x1="8.71878" y1="6.69467" x2="19.8352" y2="18.4287" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-50)" />
          <stop offset="1" stopColor="var(--brand-100)" />
        </linearGradient>
        {/* Facet shading — transparent → brand teal (reused for all facets) */}
        <linearGradient id="offresG1" x1="11.998" y1="5.40476" x2="14.3508" y2="17.1099" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG2" x1="10.8808" y1="12.4178" x2="21.7625" y2="17.7116" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG3" x1="15.586" y1="13.7006" x2="25.1737" y2="8.64203" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG4" x1="3.85422" y1="13.1815" x2="13.7107" y2="23.5856" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG5" x1="16.4243" y1="15.4631" x2="20.3064" y2="19.4628" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG6" x1="7.5296" y1="6.74107" x2="11.9295" y2="8.88158" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG7" x1="16.8847" y1="13.5805" x2="7.8852" y2="16.9921" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG8" x1="14.3087" y1="9.7549" x2="7.48561" y2="2.22596" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG9" x1="11.387" y1="13.0239" x2="4.3399" y2="5.97673" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        <linearGradient id="offresG10" x1="24.1085" y1="12.8606" x2="20.032" y2="8.78415" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
        {/* Sparkles — palette gold */}
        <linearGradient id="offresG11" x1="5.25346" y1="-0.768397" x2="10.0334" y2="5.23883" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-100)" />
          <stop offset="1" stopColor="var(--accent-500)" />
        </linearGradient>
        <linearGradient id="offresG12" x1="4.73806" y1="5.96542" x2="7.12797" y2="8.96898" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-100)" />
          <stop offset="1" stopColor="var(--accent-500)" />
        </linearGradient>
        <linearGradient id="offresG13" x1="21.1443" y1="12.2906" x2="23.5342" y2="15.2942" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-100)" />
          <stop offset="1" stopColor="var(--accent-500)" />
        </linearGradient>
        <linearGradient id="offresG14" x1="0.722434" y1="13.9488" x2="3.11234" y2="16.9524" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-100)" />
          <stop offset="1" stopColor="var(--accent-500)" />
        </linearGradient>
        <linearGradient id="offresG15" x1="18.7342" y1="7.07577" x2="21.1241" y2="10.0793" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-100)" />
          <stop offset="1" stopColor="var(--accent-500)" />
        </linearGradient>
        <clipPath id="offresClip">
          <rect width="26" height="26" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
