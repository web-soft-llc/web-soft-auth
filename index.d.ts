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

export interface MessageTransport {
  send(destination: string, code: number): Promise<void>;
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

declare class LockoutRecord {
  constructor();
  fail(): void;
  freeTime(): number;
  isLock(): boolean;
  renew(time: number): void;
}

export declare class MessageService {
  constructor();
  setTransport(transport: MessageTransport): void;
  setCodeTimeOut(timeout: number): void;
  send(destination: string): Promise<string>;
  checkDestination(destination: string): boolean;
  getCode(destination: string): boolean;
  deleteCode(destination: string): void;
}

export declare class LockoutManager {
  constructor();
  access(username: string): boolean;
  fail(username: string): void;
}

export declare class Auth {
  constructor(manager: LockoutManager);
  register(
    data: { username: string; password: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  login(
    data: { username: string; password: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  logout(data: object, context: Client): Promise<void>;
  me(data: object, context: Client): Promise<{ username: string; role: string; createdTime: string }>;
  changePassword(
    data: { oldPassword: string; newPassword: string },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
}

export declare class TwoFactorAuth extends Auth {
  constructor(service: MessageService, manager: LockoutManager);
  register(
    data: { username: string; password: string; code: number },
    context: Client
  ): Promise<{ username: string; role: string; createdTime: string }>;
  restore(data: { username: string; password: string; code: number }): Promise<string>;
  send(data: { destination: string }): Promise<string>;
}

export const AuthModule: ServerModule<Auth>;
export const TwoFactorAuthModule: ServerModule<TwoFactorAuth>;

export const messageService: MessageService;
export const lockoutManager: LockoutManager;

export const CODE_TIMEOUT: number;
export const OBSERVATION_WINDOW: number;
export const LOCKOUT_THRESHOLD: number;
