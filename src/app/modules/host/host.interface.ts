import { Event, Review, User } from "@prisma/client";

export interface Host {
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber: string;
  organization?: string | null;
  isDeleted: boolean;
  averageRating: number;
  // relations
  user?: User;
  events?: Event[];
  reviews?: Review[]; 
}