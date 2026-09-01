import chopping from '@/assets/illustrations/chopping.png';
import tossing from '@/assets/illustrations/tossing.png';
import pouring from '@/assets/illustrations/pouring.png';
import whisking from '@/assets/illustrations/whisking.png';

/*
 * Hand-drawn cooking figures for the hero. Black line art on transparency, so
 * they sit on the white hero without fighting the lemon accent.
 *
 * Licensing: these are Flaticon stickers by paulalee. Free use requires
 * attribution, which lives in the site Footer — do not remove it while these
 * images are in the bundle.
 */

const ILLUSTRATIONS = [
  { src: chopping, rotate: '-6deg', translate: 'lg:translate-y-2' },
  { src: tossing, rotate: '5deg', translate: 'lg:-translate-y-3' },
  { src: pouring, rotate: '4deg', translate: 'lg:-translate-y-2' },
  { src: whisking, rotate: '-5deg', translate: 'lg:translate-y-3' },
];

export function HeroIllustrations() {
  return (
    /*
     * Decorative only: the figures repeat what the headline already says, so
     * they are hidden from assistive tech rather than given invented alt text.
     */
    <div aria-hidden="true" className="grid grid-cols-4 gap-2 lg:mt-16 lg:grid-cols-2 lg:gap-4">
      {ILLUSTRATIONS.map(({ src, rotate, translate }) => (
        <img
          key={src}
          src={src}
          alt=""
          /* Intrinsic size is set so the hero does not reflow as they decode. */
          width={512}
          height={512}
          className={`h-auto w-full ${translate}`}
          style={{ transform: `rotate(${rotate})` }}
        />
      ))}
    </div>
  );
}
