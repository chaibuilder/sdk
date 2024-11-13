import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../ui/shadcn/components/ui/select.tsx";
import { Label } from "../../../../../ui/shadcn/components/ui/label.tsx";
import { ScrollArea } from "../../../../../ui/shadcn/components/ui/scroll-area.tsx";

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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm capitalize">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-[9999] ">
          <ScrollArea className="max-h-[400px] overflow-y-auto">
            {FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value} className="transition-colors ease-in hover:bg-gray-200">
                {font.title}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontSelector;
