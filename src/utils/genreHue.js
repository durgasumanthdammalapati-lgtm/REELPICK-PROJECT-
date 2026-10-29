// Poster colour (HSL hue) is picked from a movie's first genre.
const HUES = {
  Action: 12,
  Adventure: 30,
  Animation: 160,
  Comedy: 45,
  Crime: 350,
  Drama: 215,
  Fantasy: 285,
  Horror: 0,
  Music: 320,
  Mystery: 255,
  Romance: 335,
  "Sci-Fi": 195,
  Thriller: 230,
};

export function genreHue(genre) {
  return HUES[genre] ?? 210;
}
