# Mirka Laura Severa
A static portfolio website for photographer Mirka Laura Severa.

Live: https://www.mirkalaurasevera.com/

## Aim
A creative, eye catching website that puts photography examples front and centre. Must require minimal developer maintenance support; all content should be editable directly by client, but with no server or CMS maintenance.

## Tooling
* Next.js
* Vercel hosting
* React Spring for animations
* Sharp for image preprocessing
* Pages.cms for static admin control
* Nothing shocking to see here.

## Notes on learnings for future
Will add as they appear.
* Next.js applies a `display: none` until entire app is ready, which kills any loading page during initial load. I think this is a recent change? Can be avoided by using CSS in JSX, but it seems modules are no longer where Next.js is placing efforts.
