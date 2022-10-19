/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, CancelTokenSource } from "axios";
import { IFetchRequestStruct, IFetchRequest, ApiBase } from "../types/api";
import { devLog } from "@/commonFunctions/devLog";
import { deepCopy } from "@/commonFunctions/jsonObjectManipulation";

const PRINT_LOGS_SERVER_SIDE = false;
const LOG = process.env.DO_NOT_PRINT_API_LOGS ? false : PRINT_LOGS_SERVER_SIDE || process.browser;

//Convert js objects to url Params if using GET
function convertDataToParams(dataPre: unknown): string {
	if (typeof dataPre === "string" || typeof dataPre["getMonth"] === 'function') {
		console.error("Invalid object passed to api! If get body passed, must be an object with params.");
		return;
	}

	let data = JSON.parse(JSON.stringify(dataPre)); // prevents changes to original data
	let getParams = '?';
	Object.keys(data).forEach((e) => {
		if (!!data[e] && typeof data[e].getMonth === 'function') {
			data[e] = data[e].toUTCString();
		}

		if (!!data[e] && Array.isArray(data[e])) {
			let arrTxt = '';
			data[e].forEach((entry, i) => {
				arrTxt += (i === 0 ? '' : e + "=") + entry + "&";
			});

			data[e] = arrTxt.substring(0, arrTxt.length - 1);
		}

		getParams += e + '=' + data[e] + '&'
	})

	return getParams.substring(0, getParams.length - 1);
}

//S = result state
//R = request 
function generateAxiosRequest<S, R>(request: IFetchRequestStruct<S, R>, cancelToken?: CancelTokenSource, accessToken?: string): AxiosRequestConfig {

	let axiosRequest: AxiosRequestConfig = {
		url: request.url,
		method: request?.method ?? 'get',
		cancelToken: cancelToken?.token ?? axios.CancelToken.source().token,
		...request.config, // Override default values with our request ones
	};

	// If GET request and we are passing data, add them as query params. Otherwise add it to the data body
	if (request.data) {
		if (axiosRequest.method.toLocaleLowerCase() === 'get') {
			axiosRequest.url += convertDataToParams(request.data);
		}
		else {
			axiosRequest.data = request.data;
		}
	}

	let configHeaders = {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	};

	// Append context details i.e. aspen authorisation for aspen calls
	switch (request.base) {
		case ApiBase.None:
			break;

		case (null):
		case (undefined):
		case (ApiBase.Aspen):
			axiosRequest.baseURL = process.env.ASPEN_API_URL;
			if (accessToken) {
				configHeaders['Authorization'] = accessToken;
				configHeaders['X-Authorization-Vid'] = accessToken;
			}
			break;
	}

	axiosRequest.headers = { ...configHeaders, ...axiosRequest.headers };

	return axiosRequest;
}

// function isFetchRequestStruct<S,T>(r: FetchRequestStruct<S, T> | string | null | undefined ): r is FetchRequestStruct<S, T> {
// 	return (r as FetchRequestStruct<S, T>).url !== undefined;
// }

function concreteFetchRequest<S, R>(request: IFetchRequest<S, R>): IFetchRequestStruct<S, R> {
	if (!request || !(typeof request === 'string' || !!request.url))
		throw new Error("Invalid request! No path provided");

	if (typeof request === 'string') {
		request = {
			url: request
		} as IFetchRequest<S, R>;
	}
	return request as IFetchRequestStruct<S, R>;
}

export function hitApi<S, R = string>(requestInput: IFetchRequest<S, R>, accessToken?: string, cancelToken?: CancelTokenSource): Promise<S> {
	const request = concreteFetchRequest(requestInput);

	return new Promise<S>((resolutionFunc, rejectionFunc) => {

		let axiosRequest = generateAxiosRequest(request, cancelToken, accessToken);

		const callback: Function = request.callback ? request.callback.bind({}) : null;

		LOG && devLog("Data API call: ", axiosRequest);
		axios(axiosRequest).then(result => {
			LOG && devLog("Raw API response: " + axiosRequest.url, result);

			//the copy will fix date issues - utc from api will auto translate to localtime
			//only copy if running on client - server side getstaticprops output is not allowed to contain dates
			if (result.headers["content-type"]?.includes("application/json") && typeof window !== 'undefined') {
				result.data = deepCopy(result.data);
			}

			if (callback) {
				//checking response removes the need to return response in callback if untouched
				const callbackResponse = callback(result.data);
				if (callbackResponse) {
					result.data = callbackResponse;
				}
			}

			//Type Check
			if (result.data as S === null) {
				//rejectionFunc("API: Failed Type Check!");
				throw new Error("API: Failed Type Check!")
			}

			resolutionFunc(result.data);
		}).catch(error => {
			if (!axios.isCancel(error)) {
				console.error("Err", error);
				rejectionFunc(error);
			}
			else {
				devLog("Api request cancelled ", request);
			}
		});
	});

	//return Promise.resolve<S>(call);
}

export const objectToFormData = (obj: any): FormData => {
	let formData = new FormData();
	appendFormData(formData, obj);
	return formData;
}

const appendFormData = (formData: FormData, data: any, root = null): void => {
	root = root || '';
	if (data instanceof File) {
		formData.append(root, data);
	} else if (Array.isArray(data)) {
		for (let i = 0; i < data.length; i++) {
			if (data[i] instanceof File) {
				appendFormData(formData, data[i], root);
			} else {
				appendFormData(formData, data[i], root + '[' + i + ']');
			}
		}
	} else if (typeof data === 'object' && data) {
		for (let key in data) {
			if (data.hasOwnProperty(key)) {
				if (root === '') {
					appendFormData(formData, data[key], key);
				} else {
					appendFormData(formData, data[key], root + '.' + key);
				}
			}
		}
	} else {
		if (data !== null && typeof data !== 'undefined') {
			formData.append(root, data);
		}
	}
}