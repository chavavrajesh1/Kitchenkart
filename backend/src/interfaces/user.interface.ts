
export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'customer' | 'vendor';
    PhoneNumber?: string;
    createdAt?: Date;
    comparePassword(enteredPassword: string): Promise<boolean>;
}