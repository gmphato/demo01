import { useState, useEffect, useReducer, useCallback, Reducer, useContext, useRef } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { IApiAction, ApiActionType, IApiState, IFetchRequest, IFetchRequestStruct, ApiResultState } from '@/types/api/index';
import { devWarn } from '@/commonFunctions/devLog';
import { deepEqual } from '@/commonFunctions/jsonObjectManipulation';
import { hitApi } from '@/commonFunctions/api';
import { AuthContext } from '@/contexts/authContext';

//State management
function dataFetchReducer<T>(state: IApiState<T>, action: IApiAction<T>): IApiState<T> {
	switch (action.type) {
		case ApiActionType.FetchInit:
			//cancel previous request
			if (state.isLoading && !!state.cancelToken) {
				devWarn("Cancelled!", action.payload);
				state.cancelToken.cancel();
			}
			return {
				...state,
				cancelToken: axios.CancelToken.source(),
				isLoading: true,
				resultState: undefined
			};
		case ApiActionType.FetchSuccess:
			return {
				...state,
				isLoading: false,
				resultState: ApiResultState.Success,
				data: action.payload,
				cancelToken: undefined
			};
		case ApiActionType.FetchFailure: {
			let resultState = ApiResultState.Error;
			let data = undefined;
			if (action.payload && axios.isAxiosError(action.payload)) {

                const status = action.payload.response as any;
                
				if (status == 400) {
					resultState = ApiResultState.ValidationFailure
					data = action.payload.response?.data;
				}
				else if (status == 403)
					resultState = ApiResultState.Forbidden;
				else if (status == 401)
					resultState = ApiResultState.Unauthorised;
				else if (status == 409)
					resultState = ApiResultState.Conflict;
			}
			return {
				...state,
				isLoading: false,
				resultState: resultState,
				cancelToken: undefined,
				data: data
			};
		}
		case ApiActionType.DataUpdate:
			return {
				...state,
				data: action.payload
			}
		default:
			throw new Error("Unknown IApiActionType");
	}
}

//caching should be taken care of outside of hook using usememo
//poss bug - loop if IFetchRequest object passed as initialRequest
/*
Typing: 
	R -> Request Type
	S -> State Type
 */

export function useApi<S, R = string>(initialRequest?: IFetchRequest<S, R>, initialData?: S):
	[IApiState<S>, (requestNew?: IFetchRequest<S, R> | null | string) => void, () => void] {

	const [request, setRequest] = useState<IFetchRequest<S, R>>(initialRequest);
	const prevRequest = useRef<IFetchRequest<S, R>>();
	const lastCall = useRef<number>(0); ///> used to throttle (should not call same call again for 1s)
	const [authState] = useContext(AuthContext);
	const [state, dispatch] = useReducer<Reducer<IApiState<S>, IApiAction<S>>>(dataFetchReducer, {
		isLoading: false,
		resultState: {},
		data: initialData,
		cancelToken: axios.CancelToken.source()
	} as IApiState<S>);
     
	const cancelTokenPrev = useRef<CancelTokenSource>();

	const callApi = useCallback((r: IFetchRequest<S, R>) => {
		// By default (null, true, etc.) we wait until the token is available before making any requests
		let waitForAuth = (r as IFetchRequestStruct<S, R>)?.waitForAuth !== false;
		// if (r != null && (!waitForAuth || (waitForAuth && authState?.accessToken))) {
		if (r != null) {
		

			dispatch({ type: ApiActionType.FetchInit });
			lastCall.current = Date.now();

			//cancel previous if running
			if (cancelTokenPrev.current) cancelTokenPrev.current.cancel();

			//create new cancelation token for current call
			const cancelTokenSource = axios.CancelToken.source();
			cancelTokenPrev.current = cancelTokenSource;

			hitApi<S, R>(r, authState?.accessToken, cancelTokenSource)
				.then((result) => {
					prevRequest.current = r;
					cancelTokenPrev.current = undefined;
					dispatch({ type: ApiActionType.FetchSuccess, payload: result });
				}).catch((error) => {
					dispatch({ type: ApiActionType.FetchFailure, payload: error });
				});
		}
	}, [authState.accessToken]);

	useEffect(() => {
		//recall if no fetch object passed using (if valid) last fetch request 
		if (!request && !!prevRequest.current) {
			// When calling without parameters in the brackets
			setRequest(prevRequest.current);
			prevRequest.current = undefined; // Remove last call so equalsPrev doesn't flag 
		}
		else if (request) {

			const equalsPrev = deepEqual(prevRequest.current, request);

			//throttle to 1 call per second
			if (((Date.now() - lastCall.current) < 1000) && equalsPrev) {
				devWarn("To many calls! Throttling. Please restructure code", request);
				return;
			}

			// if caching is enabled
			// warn dev about their code incorrectly doing identical calls (when they've passed identical params)			
			if ((request as IFetchRequestStruct<S, R>)?.disableCache !== true && equalsPrev) {
				devWarn("Identical call detected so using cached - this should be avoided so please ensure code is structured correctly. Either flag disableCache if it is or restructure to recall with empty parameters as this will recall using the last params");
				return;
			}

			callApi(request);
		}
	}, [request, callApi]);

	const cancel = (): void => cancelTokenPrev.current?.cancel();

	// USE Below for debugging
	// useEffect(() => {
	// 	devLog("authState change", authState);
	// }, [authState]);

	// useEffect(() => {
	// 	devLog("callApi change", request);
	// }, [request]);

	// useEffect(() => {
	// 	devLog("request change", request);
	// }, [request]);

	// useEffect(() => {
	// 	devLog("initialRequest change", initialRequest);
	// }, [initialRequest]);

	// useEffect(() => {
	// 	devLog("state change", state);
	// }, [state]);


	return [state, setRequest, cancel];
}

