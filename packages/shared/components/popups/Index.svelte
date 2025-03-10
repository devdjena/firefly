<script lang="typescript">
    import { Icon } from 'shared/components'
    import { closePopup, popupState } from 'shared/lib/popup'
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import AddNode from './AddNode.svelte'
    import AddressHistory from './AddressHistory.svelte'
    import Backup from './Backup.svelte'
    import BalanceFinder from './BalanceFinder.svelte'
    import Busy from './Busy.svelte'
    import DeleteAccount from './DeleteAccount.svelte'
    import DeleteProfile from './DeleteProfile.svelte'
    import Diagnostics from './Diagnostics.svelte'
    import ErrorLog from './ErrorLog.svelte'
    import HideAccount from './HideAccount.svelte'
    import LedgerAddress from './LedgerAddress.svelte'
    import LedgerAppGuide from './LedgerAppGuide.svelte'
    import LedgerConfirmation from './LedgerConfirmation.svelte'
    import LedgerConnectionGuide from './LedgerConnectionGuide.svelte'
    import LedgerLegacyTransaction from './LedgerLegacyTransaction.svelte'
    import LedgerMigrateIndex from './LedgerMigrateIndex.svelte'
    import LedgerNotConnected from './LedgerNotConnected.svelte'
    import LedgerTransaction from './LedgerTransaction.svelte'
    import MissingBundle from './MissingBundle.svelte'
    import Password from './Password.svelte'
    import QR from './QR.svelte'
    import RemoveNode from './RemoveNode.svelte'
    import RiskFunds from './RiskFunds.svelte'
    import Snapshot from './Snapshot.svelte'
    import Transaction from './Transaction.svelte'
    import Version from './Version.svelte'
    import Video from './Video.svelte'
    import { Locale } from 'shared/lib/typings/i18n'

    export let locale: Locale

    export let type = undefined
    export let props = undefined
    export let hideClose = undefined
    export let fullScreen = undefined
    export let transition = true

    enum PopupSize {
        Small = 'small',
        Medium = 'medium',
        Large = 'large',
    }

    let size: PopupSize = PopupSize.Medium

    $: switch (type) {
        case 'ledgerNotConnected':
            size = PopupSize.Small
            break
        case 'video':
        case 'ledgerAppGuide':
        case 'ledgerConnectionGuide':
            size = PopupSize.Large
            break
        default:
            size = PopupSize.Medium
            break
    }

    let popupContent

    const types = {
        qr: QR,
        password: Password,
        version: Version,
        backup: Backup,
        deleteAccount: DeleteAccount,
        hideAccount: HideAccount,
        addressHistory: AddressHistory,
        addNode: AddNode,
        ledgerNotConnected: LedgerNotConnected,
        ledgerConfirmation: LedgerConfirmation,
        ledgerAppGuide: LedgerAppGuide,
        ledgerConnectionGuide: LedgerConnectionGuide,
        ledgerTransaction: LedgerTransaction,
        ledgerLegacyTransaction: LedgerLegacyTransaction,
        ledgerAddress: LedgerAddress,
        ledgerMigrateIndex: LedgerMigrateIndex,
        removeNode: RemoveNode,
        busy: Busy,
        errorLog: ErrorLog,
        deleteProfile: DeleteProfile,
        diagnostics: Diagnostics,
        transaction: Transaction,
        riskFunds: RiskFunds,
        missingBundle: MissingBundle,
        balanceFinder: BalanceFinder,
        snapshot: Snapshot,
        video: Video,
    }

    const onkey = (e) => {
        if (!hideClose && e.key === 'Escape') {
            if ('function' === typeof props?.onCancelled) {
                props?.onCancelled()
            }
            closePopup($popupState?.preventClose)
        }
    }

    const focusableElements = () =>
        [...popupContent.querySelectorAll('a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])')].filter(
            (el) => !el.hasAttribute('disabled')
        )

    const handleFocusFirst = (e) => {
        const elems = focusableElements()
        if (elems && elems.length > 0) {
            elems[elems.length - 1].focus()
        }
        e.preventDefault()
    }
    const handleFocusLast = (e) => {
        const elems = focusableElements()
        if (elems && elems.length > 0) {
            elems[0].focus()
        }
        e.preventDefault()
    }

    onMount(() => {
        const elems = focusableElements()
        if (elems && elems.length > 0) {
            elems[hideClose || elems.length === 1 ? 0 : 1].focus()
        }
    })
</script>

<style type="text/scss">
    popup {
        popup-content {
            box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
            width: 100%;
            &.small {
                max-width: 360px;
            }
            &.medium {
                max-width: 480px;
            }
            &.large {
                max-width: 630px;
            }
            &.full-screen {
                box-shadow: none;
            }
        }
    }
</style>

<svelte:window on:keydown={onkey} />
<popup
    in:fade={{ duration: transition ? 100 : 0 }}
    class={`flex items-center justify-center fixed top-0 left-0 w-screen p-6
                h-full overflow-hidden z-10 ${fullScreen ? 'bg-white dark:bg-gray-900' : 'bg-gray-800 bg-opacity-40'}`}>
    <div tabindex="0" on:focus={handleFocusFirst} />
    <popup-content
        bind:this={popupContent}
        class={`${size} bg-white rounded-xl pt-6 px-8 pb-8 relative ${fullScreen ? 'full-screen dark:bg-gray-900' : 'dark:bg-gray-900'}`}>
        {#if !hideClose}
            <button
                on:click={() => closePopup($popupState?.preventClose)}
                class="absolute top-6 right-8 text-gray-800 dark:text-white focus:text-blue-500">
                <Icon icon="close" />
            </button>
        {/if}
        <svelte:component this={types[type]} {...props} {locale} />
    </popup-content>
    <div tabindex="0" on:focus={handleFocusLast} />
</popup>
