import { Label } from "../../../../../ui/shadcn/components/ui/label.tsx";
import { startCase } from "lodash-es";

const FONTS = [
  { title: "Roboto", value: "Roboto" },
  { title: "Open Sans", value: "Open Sans" },
  { title: "Montserrat", value: "Montserrat" },
  { title: "Lato", value: "Lato" },
  { title: "Poppins", value: "Poppins" },
  { title: "Oswald", value: "Oswald" },
  { title: "Raleway", value: "Raleway" },
  { title: "Ubuntu", value: "Ubuntu" },
  { title: "Nunito", value: "Nunito" },
  { title: "Merriweather", value: "Merriweather" },
  { title: "Nunito Sans", value: "Nunito Sans" },
  { title: "Playfair Display", value: "Playfair Display" },
  { title: "Rubik", value: "Rubik" },
  { title: "Inter", value: "Inter" },
  { title: "Lora", value: "Lora" },
  { title: "Kanit", value: "Kanit" },
  { title: "Fira Sans", value: "Fira Sans" },
  { title: "Hind", value: "Hind" },
  { title: "Quicksand", value: "Quicksand" },
  { title: "Mulish", value: "Mulish" },
  { title: "Barlow", value: "Barlow" },
  { title: "Inconsolata", value: "Inconsolata" },
  { title: "Titillium Web", value: "Titillium Web" },
  { title: "Heebo", value: "Heebo" },
  { title: "IBM Plex Sans", value: "IBM Plex Sans" },
  { title: "DM Sans", value: "DM Sans" },
  { title: "Nanum Gothic", value: "Nanum Gothic" },
  { title: "Karla", value: "Karla" },
  { title: "Arimo", value: "Arimo" },
  { title: "Cabin", value: "Cabin" },
  { title: "Oxygen", value: "Oxygen" },
  { title: "Overpass", value: "Overpass" },
  { title: "Assistant", value: "Assistant" },
  { title: "Tajawal", value: "Tajawal" },
  { title: "Play", value: "Play" },
  { title: "Exo", value: "Exo" },
  { title: "Cinzel", value: "Cinzel" },
  { title: "Faustina", value: "Faustina" },
  { title: "Philosopher", value: "Philosopher" },
  { title: "Gelasio", value: "Gelasio" },
  { title: "Sofia Sans Condensed", value: "Sofia Sans Condensed" },
  { title: "Noto Sans Devanagari", value: "Noto Sans Devanagari" },
  { title: "Actor", value: "Actor" },
  { title: "Epilogue", value: "Epilogue" },
  { title: "Glegoo", value: "Glegoo" },
  { title: "Overlock", value: "Overlock" },
  { title: "Lustria", value: "Lustria" },
  { title: "Ovo", value: "Ovo" },
  { title: "Suranna", value: "Suranna" },
  { title: "Bebas Neue", value: "Bebas Neue" },
  { title: "Manrope", value: "Manrope" },
];

const FontSelector = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="space-y-0.5">
      <Label className="text-sm text-slate-800">{startCase(label)}</Label>
      <select
        className="mt-1 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}>
        {FONTS.map((font) => (
          <option key={font.value} value={font.value}>
            {font.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FontSelector;
