export interface IAuthState {
	accessToken?: string,
	cookieAcknowledgement?: boolean,
	infoBannerAcknowledgement?: boolean
}

export enum AuthActionType {
	Initialise,
	Refresh,
	AcknowledgeCookieConsent,
	InitialiseInfoBanner,
	AcknowledgeInfoBanner,
}

export interface IAuthAction {
	type: AuthActionType,
	payload?: unknown
}