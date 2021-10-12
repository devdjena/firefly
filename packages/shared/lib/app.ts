import { isSoftwareProfile } from 'shared/lib/profile'
import { get, writable } from 'svelte/store'
import { localize } from './i18n'
import { stopPollingLedgerStatus } from './ledger'
import { showAppNotification } from './notifications'
import { closePopup } from './popup'
import { activeProfile, clearActiveProfile, isLedgerProfile, isStrongholdLocked } from './profile'
import { resetRouter } from './router'
import { api, destroyActor, resetWallet } from './wallet'

/**
 * Mobile mode
 */
export const mobile = writable<boolean>(false)

/**
 * Wallet access pin
 */
export const walletPin = writable<number>(null)

/**
 * Stronghold password
 */
export const strongholdPassword = writable<string>(null)

/**
 * Seed BIP39 mnemonic recovery phrase
 */
export const mnemonic = writable<string[]>(null)

/**
 * The last timestamp that the app user was active
 */
export const lastActiveAt = writable<Date>(new Date())

interface SendParams {
    amount: number
    address: string
    message: string
    isInternal: boolean
}

/**
 * Input paramaters for sending transactions
 */
export const sendParams = writable<SendParams>({ amount: 0, address: '', message: '', isInternal: false })
export const clearSendParams = (isInternal = false): void =>
    sendParams.set({ amount: 0, address: '', message: '', isInternal })

/**
 * Determines whether a user is logged in
 */
export const loggedIn = writable<boolean>(false)

/**
 * Cleanup the signup vars
 */
export const cleanupSignup = (): void => {
    mnemonic.set(null)
    strongholdPassword.set(null)
    walletPin.set(null)
}

/**
 * Log in to the current profile
 */
export const login = (): void => {
    loggedIn.set(true)
    lastActiveAt.set(new Date())
}

/**

 * Logout from current profile
 */
export const logout = (): Promise<void> =>
    new Promise<void>((resolve) => {
        const ap = get(activeProfile)

        const _cleanup = () => {
            /**
             * CAUTION: Be sure to make any necessary API calls before
             * the event actor is destroyed!
             */
            if (ap) {
                destroyActor(ap.id)
            }

            if (get(isSoftwareProfile)) {
                isStrongholdLocked.set(true)
            }
            if (get(isLedgerProfile)) {
                stopPollingLedgerStatus()
            }

            lastActiveAt.set(new Date())

            clearSendParams()
            closePopup(true)
            clearActiveProfile()
            resetWallet()
            resetRouter()

            loggedIn.set(false)

            resolve()
        }

        if (get(isSoftwareProfile) && !get(isStrongholdLocked)) {
            api.lockStronghold({
                onSuccess() {
                    _cleanup()
                },
                onError(err) {
                    _cleanup()

                    showAppNotification({
                        type: 'error',
                        message: localize(err.error),
                    })
                },
            })
        } else {
            _cleanup()
        }
    })
