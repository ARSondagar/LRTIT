export interface DirectMessage {
    item_id: string
    user_id: number
    timestamp: string
    item_type: string
    [key: string]: any
    client_context: string
}
export interface WriteDirectMessageData {
    thread_id: string,
    message: string
}