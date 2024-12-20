export declare const logger: {
    info: (message: string, context?: Record<string, any>) => void;
    warn: (message: string, context?: Record<string, any>) => void;
    error: (message: string, error?: Error, context?: Record<string, any>) => void;
    debug: (message: string, context?: Record<string, any>) => void;
    user: (message: string, userId: string, context?: Record<string, any>) => void;
    payment: (message: string, userId: string, context?: Record<string, any>) => void;
};
