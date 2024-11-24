export interface ReportStats {
    newUsers: {
      current: number;
      previous: number;
    };
    newPosts: {
      current: number;
      previous: number;
    };
    interactions: {
      current: number;
      previous: number;
    };
    interactionRate: {
      current: number;
      previous: number;
  };
}
