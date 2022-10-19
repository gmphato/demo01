const dev: boolean = process.env.NODE_ENV === 'development';

export const devLog: (...param: any[]) => void = dev ? console.log.bind(null) : () => { };

export const devWarn: (...param: any[]) => void = dev ? console.warn.bind(null) : () => { };

export const devError: (...param: any[]) => void = dev ? console.error.bind(null) : () => { };
