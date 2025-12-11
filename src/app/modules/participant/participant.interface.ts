export interface ICreateParticipant {
  userId: string;
  eventId: string;
}

export interface IUpdateParticipantStatus {
  participantId: string;
  status: "CANCELLED" | "REJECTED" | "JOINED" | "WAITING";
}
