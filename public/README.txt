# Noto Transparent Logo Assets

Generated from your attached transparent logo.

Copy all files into your Next.js `public/` folder.

Files:
- logo-noto-transparent.png
- logo-noto-header-transparent.png
- logo-noto-horizontal-transparent.png
- logo-noto-mark-transparent.png
- logo-noto-showcase-dark.png
- favicon.ico
- favicon.svg
- icon-192.png
- icon-512.png
- apple-touch-icon.png
- og-image.png

Recommended logo usage:

```tsx
<img
  src="/logo-noto-header-transparent.png"
  alt="Noto"
  className="h-10 w-auto object-contain"
/>
```

For compact icon/mark:

```tsx
<img
  src="/logo-noto-mark-transparent.png"
  alt="Noto"
  className="h-9 w-auto object-contain"
/>
```

For metadata / WhatsApp preview:
```ts
openGraph: {
  images: ["/og-image.png"],
},
twitter: {
  images: ["/og-image.png"],
},
icons: {
  icon: [
    { url: "/favicon.ico" },
    { url: "/favicon.svg", type: "image/svg+xml" },
  ],
  apple: "/apple-touch-icon.png",
}
```
