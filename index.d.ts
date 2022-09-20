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
  Module: { new (): Class };
}

declare class User {
  constructor();
  username: string;
  password: string;
  createdTime: string;
  role: string;
}

declare class Session {
  constructor();
  username: string;
  token: string;
  createdTime: string;
}

declare class Client {
  constructor();
  id: number;
  user: User;
  session: Session;
  setUser(): Promise<void>;
  emit(event: string, data: any): Promise<void>;
  checkConnection(): boolean;
  startSession(user: User): Promise<void>;
  deleteSession(): Promise<void>;
}

declare class Auth {
  constructor();
  register(
    data: { username: string; password: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  login(
    data: { username: string; password: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  logout(data: object, context: Client): Promise<{ username: string; role: string; createdTime: string }>;
  me(data: object, context: Client): Promise<{ username: string; role: string; createdTime: string }>;
  changePassword(
    data: { oldPassword: string; newPassword: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
}

export const AuthModule: ServerModule<Auth>;
