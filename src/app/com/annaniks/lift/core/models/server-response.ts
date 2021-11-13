
export interface ServerResponse<T> {
    code: number;
    data?: T,
    message?: string;
}
interface Error {
    code: number,
    message: string
}