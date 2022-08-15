export const rankColor = ['#FBE9E7', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043'];

export const getRankColor = (rank: number) => {
  if (rank < 200) {
    return rankColor[0];
  }
  if (rank < 400) {
    return rankColor[1];
  }
  if (rank < 600) {
    return rankColor[2];
  }
  if (rank < 800) {
    return rankColor[3];
  }
  return rankColor[4];
};
