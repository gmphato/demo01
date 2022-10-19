import { AxiosRequestConfig, CancelTokenSource, Method } from "axios";

export enum ApiResultState {
	Success,
	Error,
	Forbidden,
	Unauthorised,
	ValidationFailure,
	Conflict
}

export interface IApiState<T> {
	isLoading: boolean,
	resultState?: ApiResultState,
	data?: T,
	cancelToken: CancelTokenSource
}

export interface IApiValidationFailure {
	code: string
	message: string
}

export enum ApiActionType {
	FetchInit,
	FetchSuccess,
	FetchFailure,
	DataUpdate
}

export interface IApiAction<T> {
	type: ApiActionType,
	payload?: T | any
}

export enum ApiBase {
	Aspen,
	None
	//add more here, also add relevant switch to getAPIUrl in api.tsx in common
}

export interface IFetchRequestStruct<S, T> {
	url?: string,
	base?: ApiBase,
	data?: T,
	config?: AxiosRequestConfig,
	method?: Method,
	callback?: (result: unknown) => S,

	// useAPI hook features
	// These are on by default, set to false to disable
	//cache?: boolean, DEPRECIATED - to rerun last call - simply run request method with empty params
	//throttle?: boolean, DEPRECIATED - no need, allows for lazy programming
	waitForAuth?: boolean // Wait until the AuthContext access token is available before making the request 

	// Off by default, true to execute calls with identical parameters i.e. where caching would normally kick in
	disableCache?: boolean
}

export type IFetchRequest<S, T> = IFetchRequestStruct<S, T> | null | string | undefined;