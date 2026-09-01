/*
 * The credits here are licensing requirements, not decoration:
 * - paulalee's Flaticon stickers are free only with visible attribution.
 * - The demo recipe photos are CC BY-SA, which requires naming each author and
 *   linking the licence.
 * If an asset is removed, its credit can go with it — not before.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-8 text-xs sm:flex-row sm:items-start sm:justify-between">
        <p className="font-display text-sm font-bold tracking-tight">
          Haohaochifan — Cook. Save. Enjoy.
        </p>
        <div className="flex flex-col gap-1 opacity-70 sm:items-end">
          <a
            href="https://www.flaticon.com/free-stickers/male-chef"
            title="male-chef stickers"
            target="_blank"
            rel="noopener noreferrer"
            className="ink-link"
          >
            Male-chef stickers created by paulalee - Flaticon
          </a>
          <p>
            Sample photos by Gerda Arendt, HaJunkiyada and cyclonebill via Wikimedia Commons,{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0"
              target="_blank"
              rel="noopener noreferrer"
              className="ink-link"
            >
              CC BY-SA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
