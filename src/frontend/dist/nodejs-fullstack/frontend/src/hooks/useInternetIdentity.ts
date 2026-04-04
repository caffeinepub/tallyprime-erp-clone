import { createContext, useContext, type PropsWithChildren, createElement } from 'react';
export type Status = 'idle';
export type InternetIdentityContext = { identity: undefined; login: () => void; clear: () => void; loginStatus: Status; isInitializing: boolean; isLoginIdle: boolean; isLoggingIn: boolean; isLoginSuccess: boolean; isLoginError: boolean; loginError: undefined; };
const ctx = createContext<InternetIdentityContext>({ identity: undefined, login: () => {}, clear: () => {}, loginStatus: 'idle', isInitializing: false, isLoginIdle: true, isLoggingIn: false, isLoginSuccess: false, isLoginError: false, loginError: undefined });
export const useInternetIdentity = () => useContext(ctx);
export function InternetIdentityProvider({ children }: PropsWithChildren<object>) { return createElement(ctx.Provider, { value: ctx._currentValue }, children); }
