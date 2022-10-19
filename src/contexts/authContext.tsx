import { createContext, Dispatch, Reducer, useReducer, useState } from 'react'
import { IAuthAction, AuthActionType, IAuthState } from '@/types/auth'
import cookie from 'js-cookie';

const COOKIE_NAME_ACKNOWLEDGEMENT = "cookieAcknowledgement";

const initialState: [IAuthState, Dispatch<IAuthAction>] = [{ cookieAcknowledgement: cookie?.get(COOKIE_NAME_ACKNOWLEDGEMENT), infoBannerAcknowledgement: true }, () => { }];

const AuthContext = createContext(initialState);

const AuthProvider: React.FC = ({ children }) => {

	// Avoid pagebase.tsx triggering a second initialise before the first request has completed
	const [initialiseTriggered, setInitialiseTriggered] = useState(false);

	const [authState, authDispatch] = useReducer<Reducer<IAuthState, IAuthAction>>((state: IAuthState, action: IAuthAction) => {
		switch (action.type) {
			case AuthActionType.Initialise:
				if (!initialiseTriggered) {
					setInitialiseTriggered(true);
					// if (!cookie?.get(process.env.ASPEN_COOKIE_NAME)) {
					// 	// Call the API to generate our cookie
					// 	// HitApi (not useApi) to avoid circular referencing
					// 	hitApi({
					// 		url: URL_API_CUSTOMER_VISIT_NEW_ENCODED
					// 	}).then(encodedVisitId => {
					// 		if (encodedVisitId) {
					// 			cookie.set(process.env.ASPEN_COOKIE_NAME, encodedVisitId, { expires: 30, SameSite: "none", Secure: true });
					// 			authDispatch({ type: AuthActionType.Refresh });
					// 		}
					// 	});
					// }
					// else {
					// 	// If we have the cookie, but it's not set in authProvider yet, then trigger a Refresh dispatch
					// 	authDispatch({ type: AuthActionType.Refresh });
					// }
				}
				return state;

			case AuthActionType.Refresh: {
				const cookieValue = cookie?.get(process.env.ASPEN_COOKIE_NAME);
				if (cookieValue !== state.accessToken) {
					return { ...state, accessToken: cookieValue };
				}
				return state;
			}

			case AuthActionType.AcknowledgeCookieConsent:
				if (!state.cookieAcknowledgement) {
					cookie?.set(COOKIE_NAME_ACKNOWLEDGEMENT, true, { expires: 365 });
					return { ...state, cookieAcknowledgement: true };
				}
				return state;

			default:
				return state;
		}
	}, initialState[0]);

	return (
		<AuthContext.Provider value={[authState, authDispatch]}>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthContext, AuthProvider };
