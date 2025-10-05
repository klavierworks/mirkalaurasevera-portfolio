import { atom } from 'nanostores'

export const $activeAudio = atom(null as HTMLVideoElement | null);