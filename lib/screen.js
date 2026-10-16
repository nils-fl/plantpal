import { getDeviceInfo, SCREEN_SHAPE_ROUND } from '@zos/device'

// Round watches get their own layouts, in units of the 480 px round design width (px() scales them).
export const ROUND = getDeviceInfo().screenShape === SCREEN_SHAPE_ROUND
