export default function RootPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-heading mb-2 font-serif text-[32px] font-semibold">Noto</div>
        <div className="text-muted mb-8 text-[14px]">Redirect ke dashboard...</div>
        <script dangerouslySetInnerHTML={{ __html: "window.location.href = '/dashboard';" }} />
      </div>
    </div>
  );
}
