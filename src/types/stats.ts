export interface User {
    _id: string;
    email: string;
    username?: string;
    role?: string;
    createdAt?: string;
    [key: string]: any;
  }
  
  export interface Stats {
    totalUsers: number;
    totalStudyclubs: number;
    totalFiltered: number;
    users: User[];
    clubs?: StudyClub[];
    signupSeries: { date: string; users: number }[];
    studyClubSeries: { date: string; studyclubs: number }[];
  }
  export interface StudyClub {
    _id: string;
    name: string;
    members: any[];
    description?: string;
    createdAt?: string;
    [key: string]: any;
  }
  