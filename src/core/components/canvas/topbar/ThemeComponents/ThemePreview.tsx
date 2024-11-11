import React from 'react';

export const PreviewButton = React.memo(
    ({ color, label, borderRadius }: { color: string; label: string; borderRadius: string }) => (
      <button
        className="rounded px-3 py-1"
        style={{
          backgroundColor: color,
          color: "#fff", 
          borderRadius: `${borderRadius}px`,
        }}>
        {label}
      </button>
    ),
  );


export const ThemePreview = React.memo(
    ({
      mode,
      bgColor,
      textColor,
      primaryColor,
      secondaryColor,
      roundedCorners,
      headingFont,
      bodyFont,
      t,
    }: {
      mode: string;
      bgColor: string;
      textColor: string;
      primaryColor: string;
      secondaryColor: string;
      roundedCorners: string;
      headingFont: string;
      bodyFont: string;
      t: (key: string) => string;
    }) => (
      <div
        className="rounded-md border p-4"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: `${roundedCorners}px`,
        }}>
        <h5 className="mb-2 text-sm font-medium" style={{ fontFamily: `${headingFont}, sans-serif` }}>
          {t(`Theme Config.${mode} Mode Preview`)}
        </h5>
        <div className="flex gap-2" style={{ fontFamily: `${bodyFont}, sans-serif` }}>
          <PreviewButton color={primaryColor} label={t("Theme Config.Primary")} borderRadius={roundedCorners} />
          <PreviewButton color={secondaryColor} label={t("Theme Config.Secondary")} borderRadius={roundedCorners} />
        </div>
      </div>
    ),
  );