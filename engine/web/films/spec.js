// Generic film module: renders a storyboard spec passed in params.spec.
import { composeFilm } from '../lfk/compose.js';
import { EFFECTS } from '../effects/index.js';
export default async function (k, params) { return composeFilm(k, params.spec, EFFECTS); }
