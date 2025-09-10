// Local-only stripped logger (no Sentry)

type LogContext = Record<string, any>;

export const logger = {
    // Only capture critical errors in Sentry
    error: (message: string, error?: any, context: LogContext = {}) => {
        console.error(message, error, context);

    // Sentry disabled in local-only mode
    },

    // For important operational events - not sent to Sentry
    info: (message: string, context: LogContext = {}) => {
        console.log(message, context);
    },

    // For potential issues that aren't errors
    warn: (message: string, context: LogContext = {}) => {
        console.warn(message, context);
        // Only send warnings to Sentry if they might need attention
    // Sentry disabled
    },

    // Only use locally, never in production
    debug: (message: string, context: LogContext = {}) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.debug(message, context);
        }
    },
};
