export interface CreateTicketData {
    title: string;
    files?: File[]
    message: string;
    categoryId: string;
}

export interface AllTicketsResponse {
    openTickets: Ticket[];
    closeTickets: Ticket[];
}

export interface Ticket {
    id: number;
    title: string;
    statusId: number;
    categoryId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    firstMessage?: TicketFirstMessage;
    messages: TicketMessage[];
    category: TicketCategory;
    status: TicketStatus;
}

export interface TicketMessage {
    id: number;
    message: string;
    userId: number;
    ticketId: number;
    seen: boolean
    createdAt: string;
    updatedAt: string;
    user: { id: number, name:string  }
    files: AttachedFile[]
}

export class AttachedFile {
    id: number;
    name: string;
    messageId: number;
    path: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketCategory {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export declare type TicketStatus = TicketCategory;


export interface TicketFirstMessage {
    id: number;
    message: string;
    userId: number;
    ticketId: number;
    seen: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WriteTicketMessageData {
    message: string;
    ticketId: number;
    files?: File[]
}