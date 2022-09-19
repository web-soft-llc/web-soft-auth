export interface DataTypeProperties {
  [property: string]: MethodDataSchema;
}

export interface MethodDataSchema {
  type: string;
  description?: string;
  required?: Array<string>;
  properties?: DataTypeProperties;
  items?: MethodDataSchema;
  additionalProperties: boolean;
}

export interface MethodSchema {
  public?: boolean;
  description?: string;
  params?: MethodDataSchema;
  result?: MethodDataSchema;
  emit?: MethodDataSchema;
  roles?: Array<string>;
  transport?: 'ws' | 'http';
}

export interface ModuleSchema {
  [method: string]: MethodSchema;
}

export interface ServerModule<Class> {
  schema: ModuleSchema;
  Module: Class;
}

export class User {
  constructor();
  username: string;
  password: string;
  createdTime: string;
  role: string;
}

export class Session {
  constructor();
  username: string;
  token: string;
  createdTime: string;
}

export class Client {
  constructor();
  id: number;
  user: User;
  session: Session;
  async setUser(): Promise<void>;
  async emit(event: string, data: any): Promise<>;
  checkConnection(): boolean;
  async startSession(user: User): Promise<void>;
  async deleteSession(): Promise<void>;
}

export class Auth {
  constructor();
  async register(
    { username: string, password: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  async login(
    { username: string, password: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  async logout(data: any, context: Client): Promise<{ username: string; role: string; createdTime: string }>;
  async me(data: any, context: Client): Promise<{ username: string; role: string; createdTime: string }>;
  async changePassword(
    { oldPassword: string, newPassword: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
}

export const AuthModule: ServerModule<Auth>;
